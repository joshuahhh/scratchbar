/*jshint globalstrict: true*/
/*global $, Audiolet, Looper, AudioletBuffer, BufferPlayer, TriggerControl*/

"use strict";

// Stereo-to-stereo panner
var Pan2 = function(audiolet, pan) {
    AudioletNode.call(this, audiolet, 2, 1);
    // Hardcode two output channels
    this.setNumberOfOutputChannels(0, 2);
    if (pan == null) {
        var pan = 0.5;
    }
    this.pan = new AudioletParameter(this, 1, pan);
};
extend(Pan2, AudioletNode);
Pan2.prototype.generate = function() {
    var input = this.inputs[0];
    var output = this.outputs[0];

    var pan = this.pan.getValue();

    var left = input.samples[0];
    var right = input.samples[0];
    var scaledPan;
    if (pan < 0.5) {
        var scaledPan = pan * Math.PI;
        output.samples[0] = left + right * Math.cos(scaledPan);
        output.samples[1] =        right * Math.sin(scaledPan);
    } else {
        var scaledPan = (pan - 0.5) * Math.PI;
        output.samples[0] =         left * Math.cos(scaledPan);
        output.samples[1] = right + left * Math.sin(scaledPan);
    }
};

$(function () {
    // Forward definitions
    var startPosition;

    var audiolet = new Audiolet();

    // Loading samples
    var audio = new AudioletBuffer(1, 0);
    var loadSample = function (name) {
        audio.load("audio/" + name + ".wav", false);
        var data = audio.getChannelData(0);
        setLoop();

        var ctx = $("canvas").get(0).getContext("2d");
        ctx.clearRect(0, 0, $("canvas").width(), $("canvas").height());
        ctx.beginPath();
        ctx.moveTo(100, 0);
        for (var i = 0; i < $("body").height(); i += 0.25) {
            var sample = data[Math.round(i / $("body").height() * audio.length)];
            ctx.lineTo(100 + 100 * sample, i);
        }
        ctx.stroke();

        window.location.hash = '#' + name;
    };
    $("a.audio").click(function (e) {
        e.preventDefault();
        loadSample($(this).text());
    });

    // Playing and looping
    var player = new BufferPlayer(audiolet, audio, 1, 0, 1);
    var restartTrigger = new TriggerControl(audiolet);
    restartTrigger.connect(player, 0, 1);
    var looper = new Looper(audiolet);
    looper.connect(audiolet.output.upMixer);
    var setLoop = function () {
        startPosition = $(window).scrollTop() / $("body").height() * audio.length;
        var length = $(window).height() / $("body").height() * audio.length;
        looper.beatLength = Math.min(length, audio.length);
    };
    $(window).scroll(setLoop).resize(setLoop);
    setLoop();
    looper.play(function () {
        player.startPosition.setValue(startPosition);
        restartTrigger.trigger.setValue(1);
    });

    // Panning
    var pan = new Pan2(audiolet);
    player.connect(pan);
    var setPan = function () {
        pan.pan.setValue((window.screenX + window.outerWidth / 2) / window.screen.width);
        requestAnimationFrame(setPan);
    }
    setPan();

    // Final output
    pan.connect(audiolet.output);

    // No one trusts audio
    $(window).click(function () {
        audiolet.device.sink._context.resume();
    });
    var updateClickMessage = function () {
        if (audiolet.device.sink._context.state != "suspended") {
            $("#click-message").remove();
        } else {
            requestAnimationFrame(updateClickMessage);
        }
    }
    updateClickMessage();

    // Get 'er goin'
    var name = window.location.hash.substring(1);
    loadSample(name ? name : "nobody");
});
