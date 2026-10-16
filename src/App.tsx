import { PageFlip } from "@book-effects/page-flip";

export const App = () => {
	return (
		<PageFlip pageWidth={516} canvasPadding={30} className="demo-book" isSE>
			<div className="demo-page cover">
				<p className="cover-label">CANVAS NOTES</p>
				<h2>The Canvas Book</h2>
				<p>A short journey through drawing on the web.</p>
				<p className="cover-hint">右から左へドラッグして開く</p>
			</div>
			<div className="demo-page">
				<h2>Welcome</h2>
				<p>
					Open this book to explore the history, uses, and possibilities of
					canvas. Each sheet has a different story on its front and back.
				</p>
			</div>
			<div className="demo-page">
				<h2>History</h2>
				<p>
					Canvas was initially introduced by Apple for use inside their own Mac
					OS X WebKit component, powering applications like Dashboard widgets
					and the Safari browser. Later, it was adopted by Gecko browsers and
					Opera and standardized by the WHATWG on new proposed specifications
					for next generation web technologies.
				</p>
			</div>
			<div className="demo-page">
				<h2>Early Experiments</h2>
				<p>
					A blank canvas starts with a simple idea: place a mark, choose a
					color, and see what happens. Small experiments with lines and shapes
					can become illustrations, interactive stories, or entire worlds.
				</p>
			</div>
			<div className="demo-page">
				<h2>Usage</h2>
				<p>
					Canvas consists of a drawable region defined in HTML code with height
					and width attributes. JavaScript code may access the area through a
					full set of drawing functions similar to other common 2D APIs, thus
					allowing for dynamically generated graphics. Some anticipated uses of
					canvas include building graphs, animations, games, and image
					composition.
				</p>
			</div>
			<div className="demo-page">
				<h2>Drawing Practice</h2>
				<p>
					Try composing a scene from a few simple shapes. Add a background
					first, then objects in the foreground. Adjust their colors and
					positions to explore how each layer changes the finished picture.
				</p>
			</div>
			<div className="demo-page">
				<h2>Reactions</h2>
				<p>
					At the time of its introduction the canvas element was met with mixed
					reactions from the web standards community. There have been arguments
					against Apple's decision to create a new proprietary element instead
					of supporting the SVG standard. There are other concerns about syntax
					e.g. the absence of a namespace.
				</p>
			</div>
			<div className="demo-page">
				<h2>A Different Perspective</h2>
				<p>
					Turning a page reveals another side of the story. This reverse face
					has its own text, independent of the front, while following the same
					paper as it bends and settles on the left.
				</p>
			</div>
			<div className="demo-page">
				<h2>Support</h2>

				<p>
					The element is currently supported by the latest versions of Mozilla
					Firefox, Google Chrome, Safari, and Opera. It is not natively
					implemented by Internet Explorer (IE) as of version 8, though support
					is in development for Internet Explorer 9; however, many of the Canvas
					element's features can be supported in IE, for example by using Google
					or Mozilla plugins, JavaScript libraries and either Adobe Flash or
					IE's proprietary VML.
				</p>
			</div>
			<div className="demo-page">
				<h2>The End</h2>
				<p>
					Thank you for reading. Turn one more sheet to close the book, or drag
					a page from left to right to revisit an earlier chapter.
				</p>
			</div>
			<div className="demo-page">
				<h2>Colophon</h2>
				<p>The Canvas Book</p>
				<p>An interactive experiment in pages, drawing, and motion.</p>
			</div>
			<div className="demo-page cover">
				<p className="cover-label">CANVAS NOTES</p>
				<h2>
					Thank you
					<br />
					for reading.
				</h2>
				<p className="cover-hint">左から右へドラッグして開く</p>
			</div>
		</PageFlip>
	);
};
