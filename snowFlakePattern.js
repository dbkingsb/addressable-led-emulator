// Snowflake Model
var fallRate = 1; // mm per ms, 3.5 feet per s
var failRateVariance = .71; // 71%; 1 - 6 feet per s measured avg
var intensityThresh = 90;
var snowflakeStringDensity = 1;
var model = {
	lastFrameTs: Date.now(),
	frameTs: Date.now(),
	snowflakes: []
};
// emulator interface impl
function getRgbArr(frameTs, lastFrameTs) {
	modelSnowflakes(frameTs, lastFrameTs);
	// prefill is not necessary
	var rgbArr = [];
	for (var i=0; i<model.snowflakes.length; i++) {
		var sf = model.snowflakes[i];

		var nearByLedIdxs = []
		var fuzzyLedIdx = (sf.y) / stringLedSpacing ;

		if (Math.ceil(fuzzyLedIdx) < stringLedCount) {
			// middle led
			nearByLedIdxs.push(Math.round(fuzzyLedIdx));
			// before led
			if (nearByLedIdxs[0] % stringLedCount-1 != 0) {
				nearByLedIdxs.push(nearByLedIdxs[0]-1);
			}
			// next led
			if (nearByLedIdxs[0] % stringLedCount != 0) {
				nearByLedIdxs.push(nearByLedIdxs[0]+1);
			}
		}
		
		for (var k=0; k<nearByLedIdxs.length; k++) {
			var ledIdx = nearByLedIdxs[k];
			var ledStartIdx = sf.x*stringLedCount*3 + ledIdx*3;
			var diff = Math.abs((ledIdx*stringLedSpacing) - sf.y);
			// account for this LED being previously set by another snowflake
			var intensity = rgbArr[ledStartIdx] ? rgbArr[ledStartIdx] : 0; 
			if (diff < intensityThresh) {
				// assuming clamped array, so values over 255 are OK if two snowflakes become additive
				intensity += Math.floor(255 / intensityThresh * (intensityThresh-diff));
			}
			rgbArr[ledStartIdx] = rgbArr[ledStartIdx+1] = rgbArr[ledStartIdx+2] = intensity;					
		}
	}
	return rgbArr;
}
// emulator interface impl
function drawModel(canvas, ctx) {
	for (var i=0; i<model.snowflakes.length; i++) {
		var sf = model.snowflakes[i];
		var x = getStringLeadInPx() + sf.x*getStringSpacingInPx() - 20;
		var y = convertYToPx(sf.y+stringLedLead);
		ctx.beginPath();
		ctx.fillStyle = "rgb(244,3,244)";
    	ctx.arc(x,y,convertYToPx(stringLedSize),0,Math.PI*2,false);
    	ctx.fill();				
	}
}
function modelSnowflakes(frameTs, lastFrameTs) {
	// snowflake init
	if (model.snowflakes.length==0) {
		for (var i=0; i<stringCount; i++) {
			for (var j=0; j<snowflakeStringDensity; j++) {
				model.snowflakes.push(createSnowflake(i));
			}
		}
	}
	// move
	for (var i=0; i<model.snowflakes.length; i++) {
		var sf = model.snowflakes[i];
		sf.y = drop(sf.y, sf.fallRate, frameTs-lastFrameTs);
		// destroy snowflake once it falls beyond the string, and create a new one
		if (sf.y > getStringLength() + intensityThresh) {
			model.snowflakes.push(createSnowflake(sf.x));
			model.snowflakes.splice(i,1);
		}
	}
}
function createSnowflake(stringIdx) {
	return {
		x:stringIdx, y:0,
		fallRate: (fallRate+fallRate*failRateVariance) - Math.random()*fallRate*failRateVariance*2
	}			
}
function drop(y, s, dt) {
	var newY = y ? y : 0;
	newY += dt * s;
	return newY;
}
function getLowestLedY() {
	return stringLedCount * stringLedSpacing*2;
}