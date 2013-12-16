/*jshint globalstrict: true*/
/*global $, Audiolet, Looper, AudioletBuffer, BufferPlayer, TriggerControl*/

"use strict";

$(function () {
    var start;

    var audiolet = new Audiolet();
    var looper = new Looper(audiolet);
    looper.connect(audiolet.output.upMixer);

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

    var player = new BufferPlayer(audiolet, audio, 1, 0, 1);
    var restartTrigger = new TriggerControl(audiolet);

    restartTrigger.connect(player, 0, 1);
    player.connect(audiolet.output);

    var setLoop = function () {
        start = $(window).scrollTop() / $("body").height() * audio.length;
        var length = $(window).height() / $("body").height() * audio.length;
        looper.beatLength = Math.min(length, audio.length);
    };
    $(window).scroll(setLoop).resize(setLoop);
    setLoop();

    looper.play(function () {
        player.startPosition.setValue(start);
        restartTrigger.trigger.setValue(1);
    });

    $("a.audio").click(function (e) {
        e.preventDefault();
        loadSample($(this).text());
    });

    var name = window.location.hash.substring(1);
    loadSample(name ? name : "nobody");
});
