var canvas;
var ctx;
var frameTs;
var lastFrameTs;
var refreshRate = 50;
var shouldDrawModel = true;

var stringCount = 12;
var stringLedCount = 50;
var stringLedLead = 120; // mm
var stringLedSpacing = 70; // mm
var stringLedSize = 8; // mm

function init() {
	canvas = document.getElementById('myCanvas');
	ctx = canvas.getContext('2d');
	createButtons();
	requestFrame();
}
function requestFrame() {
	setTimeout(function() {
		draw();
	}, refreshRate);
}
function draw() {

	// frame init
	frameTs = Date.now();
	if (!lastFrameTs) {
		lastFrameTs = frameTs;
	}

	var rgbArr = getRgbArr(frameTs, lastFrameTs);

	// clear canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// LED strings
	for (var i=0; i<stringCount; i++) {
		for (var k=0; k<stringLedCount; k++) {
			ctx.beginPath();
			ctx.strokeStyle = "rgb(100,100,100)";
			var r = rgbArr[i*stringLedCount*3 + k*3];
			var g = rgbArr[i*stringLedCount*3 + k*3+1];
			var b = rgbArr[i*stringLedCount*3 + k*3+2];
			if (r || g || b) {
				ctx.fillStyle = "rgb("+r+","+g+","+b+")";
			}
			else {
				ctx.fillStyle = "rgb(0,0,0)";
			}
			ctx.arc(
				i * getStringSpacingInPx()+getStringLeadInPx(),
				convertYToPx( k * stringLedSpacing+stringLedLead ),
				convertYToPx(stringLedSize),
				0, Math.PI*2, false);
			ctx.stroke();
			ctx.fill();
		}
	}

	// The model, a representation of the pattern
	if (shouldDrawModel && typeof drawModel == 'function') {
		drawModel(canvas, ctx);
	}

	// frame conclusion
	lastFrameTs = frameTs;
	requestFrame();
}
function getStringSpacingInPx() {
	return canvas.width / stringCount;
}
function getStringLeadInPx() {
	return getStringSpacingInPx() / 2;
}
function createButtons() {
	if (isDrawModelImplemented()) {
		var modelToggleBtn = document.createElement("button");
		modelToggleBtn.innerHTML = "Toggle Model";
		modelToggleBtn.onclick = function() {
			shouldDrawModel = !shouldDrawModel;
		}
		document.body.appendChild(modelToggleBtn);
	}
}
function getStringLength() {
	return stringLedLead*2 + (stringLedCount-1)*stringLedSpacing;
}
function convertYToPx(y) {
	return canvas.height / getStringLength() * y;
}
function isDrawModelImplemented() {
	return typeof drawModel == 'function';
}