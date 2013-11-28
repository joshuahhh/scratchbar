$(function() {
    this.audiolet = new Audiolet();
    this.looper = new Looper(this.audiolet);
    this.looper.connect(this.audiolet.output.upMixer);

    this.audio = new AudioletBuffer(1, 0);

    var loadFile = function(name) {
	this.audio.load(name, false);
	var data = this.audio.getChannelData(0);
	var ctx = $("canvas").get(0).getContext("2d");
	ctx.clearRect(0 , 0, $("canvas").width(), $("canvas").height());
	ctx.beginPath();
	ctx.moveTo(100,0);
	for (var i = 0; i < $("body").height(); i += 0.25) {
	    var sample = data[Math.round(i/$("body").height() * this.audio.length)];
	    ctx.lineTo(100+100*sample, i);
	}
	ctx.stroke();
    }.bind(this);

    loadFile("audio/nobody.wav");

    this.player = new BufferPlayer(this.audiolet, this.audio, 1, 0, 1);
    this.restartTrigger = new TriggerControl(this.audiolet);

    this.restartTrigger.connect(this.player, 0, 1)
    this.player.connect(this.audiolet.output);

    var func = function(event) {
	start = $(window).scrollTop() / $("body").height() * this.audio.length;
	length = $(window).height() / $("body").height() * this.audio.length;
	this.start = start;
	this.looper.beatLength = Math.min(length, this.audio.length);
    }
    $(window).scroll(func.bind(this)).resize(func.bind(this))
    func.bind(this)()

    this.looper.play(function () {
	this.player.startPosition.setValue(this.start);
	this.restartTrigger.trigger.setValue(1);
	}.bind(this)
    );

    $("a.audio").click(function () {
	loadFile("audio/" + $(this).text() + ".wav");
    })
})
