import assert from 'node:assert/strict';
const cdpUrl = process.env.CDP_URL || 'http://127.0.0.1:9229';
const testUrl = process.env.TEST_URL || 'http://127.0.0.1:5174';
const targets = await (await fetch(cdpUrl + '/json')).json();
const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener('open', resolve, {once:true}));
let id = 0;
const pending = new Map();
ws.addEventListener('message', event => {
  const data = JSON.parse(event.data);
  if (data.id) { const p = pending.get(data.id); pending.delete(data.id); data.error ? p.reject(data.error) : p.resolve(data.result); }
});
const send = (method, params={}) => { return new Promise((resolve,reject) => { pending.set(++id,{resolve,reject}); ws.send(JSON.stringify({id,method,params})); }); };
const pause = ms => new Promise(resolve => setTimeout(resolve,ms));
const evaluate = async (expression) => { const r = await send('Runtime.evaluate',{expression,returnByValue:true}); if(r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails)); return r.result.value; };
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:3,mobile:true});
await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
await send('Page.navigate',{url:testUrl});
for (let attempt=0;attempt<100;attempt++) {
  if (await evaluate("document.querySelector('.bf-book')?.dataset.layout")) break;
  await pause(100);
}
assert.ok(await evaluate("document.querySelector('.bf-book')?.dataset.layout"), 'Book must finish mounting');
await evaluate(`window.touchLog=[]; for(const type of ['pointerdown','pointermove','pointerup','pointercancel','lostpointercapture']) document.querySelector('.bf-book').addEventListener(type,e=>touchLog.push([type,e.target.tagName,e.clientX]));`);
const state = async () => { return evaluate(`(()=>{const b=document.querySelector('.bf-book'), p=document.querySelector('.bf-sheet.is-current'), r=b.getBoundingClientRect();return {index:[...document.querySelectorAll('.bf-pages > .bf-sheet')].indexOf(p)*2+(p.dataset.face==='back'?1:0),turning:b.classList.contains('is-turning'),width:r.width,height:r.height,status:!!document.querySelector('.page-status')}})()`); };
const swipe = async (from,to,y=250) => {
  await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:from,y}]});
  for(let i=1;i<=10;i++){await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:from+(to-from)*i/10,y}]});await pause(20);}
  await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await pause(800);
};
try {
  console.log('initial',await state());
  await swipe(330,80); console.log('next',await state()); assert.equal((await state()).index,1);
  await swipe(80,330); assert.equal((await state()).index,0);
  await swipe(330,300); assert.equal((await state()).index,0);
  for(let n=1;n<12;n++){await swipe(330,80);assert.equal((await state()).index,n);}
  await swipe(330,80); assert.equal((await state()).index,11);
  const s=await state(); assert.ok(Math.abs(s.height-844*.9)<0.1);assert.equal(s.status,false);
  console.log('PASS: demo touch navigation through 12 faces and 90dvh height');
  await send('Page.navigate',{url:testUrl + '/tests/react.html'});
  await pause(700);
  const fixture = () => evaluate(`(()=>{const a=document.querySelector('.first'), b=document.querySelector('.second'),r=a?.querySelector('.bf-book').getBoundingClientRect();return {canvases:document.querySelectorAll('.bf-single-canvas').length, firstMode:a?.dataset.layout, secondMode:b.dataset.layout, width:r?.width, height:r?.height, selected:document.querySelector('#selected').textContent, index:a?[...a.querySelectorAll('.bf-sheet')].indexOf(a.querySelector('.is-current'))*2+(a.querySelector('.is-current').dataset.face==='back'?1:0):null, secondWidth:b.style.getPropertyValue('--page-width')}})()`);
  let f=await fixture();assert.equal(f.canvases,2);assert.equal(f.firstMode,'single');assert.equal(f.secondMode,'spread');assert.ok(Math.abs(f.width-356)<.1);assert.ok(Math.abs(f.height-844*.9)<.1);
  await swipe(280,70,150);f=await fixture();assert.equal(f.selected,'1');assert.equal(f.index,1);assert.equal(f.canvases,2);
  await evaluate("document.querySelector('#resize').click()");await pause(400);f=await fixture();assert.ok(Math.abs(f.width-356)<.1);assert.equal(f.index,1);assert.equal(f.secondWidth,'210px');
  await evaluate("document.querySelector('#toggle').click()");await pause(200);assert.equal((await fixture()).canvases,1);
  await evaluate("document.querySelector('#toggle').click()");await pause(300);assert.equal((await fixture()).canvases,2);assert.equal((await fixture()).index,0);
  await swipe(280,70,150);assert.equal((await fixture()).index,1);
  console.log('PASS: independent instances, nested content, custom ratio, callback, props changes, StrictMode cleanup, unmount/remount');
  await send('Page.navigate',{url:testUrl});await pause(400);
  for (const [width,height] of [[320,568],[390,844],[458,844],[459,844],[458,600],[390,420],[390,360],[700,600],[600,390]]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true});await pause(200);
    const fit=await evaluate("(()=>{const r=document.querySelector('.bf-book').getBoundingClientRect();return {width:r.width,height:r.height,bottom:r.bottom,scrollHeight:document.documentElement.scrollHeight,viewport:innerHeight}})()");
    if(width<=458) { assert.ok(Math.abs(fit.width-(width-24))<.1); assert.ok(Math.abs(fit.height-height*.9)<.1); }
    else assert.ok(Math.abs(fit.width/fit.height-5/7)<.001);
    assert.ok(fit.bottom<=height);assert.ok(fit.scrollHeight<=fit.viewport);
  }
  console.log('PASS: responsive pages fit nine viewport sizes without document scrolling');
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:testUrl});await pause(700);
  assert.equal(await evaluate("document.querySelector('.bf-book').dataset.layout"),'spread');
  const desktopDrag = async (back) => {
    const r=await evaluate("(()=>{const b=document.querySelector('.bf-book'),r=b.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,dx:516*r.width/1062*.85}})()");
    const from=r.x+(back?-r.dx:r.dx),to=r.x+(back?r.dx:-r.dx);
    await send('Input.dispatchMouseEvent',{type:'mousePressed',x:from,y:r.y,button:'left',clickCount:1});
    for(let i=1;i<=10;i++){await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:from+(to-from)*i/10,y:r.y,button:'left',buttons:1});await pause(20);}
    await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:to,y:r.y,button:'left',clickCount:1});
    for (let attempt=0;attempt<100;attempt++) {
      const width=await evaluate("document.querySelector('.bf-sheet').style.width");
      if (width===(back?'516px':'0px')) break;
      await pause(100);
    }
  };
  await desktopDrag(false);
  assert.equal(await evaluate("document.querySelector('.bf-sheet').style.width"),'0px');
  await desktopDrag(true);
  assert.equal(await evaluate("document.querySelector('.bf-sheet').style.width"),'516px');
  console.log('PASS: desktop cover opening and closing');

} catch(error) { console.log(await evaluate('window.touchLog || []'));throw error; }
finally { ws.close(); }
