/* global PassThroughNode, extend */

var Looper = function(audiolet) {
    "use strict";

    PassThroughNode.call(this, audiolet, 1, 1);
    this.linkNumberOfOutputChannels(0, 0);

    this.time = 0;
    this.seconds = 0;

    this.beatLength = 0;
    this.lastBeatTime = 0;

    this.callback = false;
};
extend(Looper, PassThroughNode);

Looper.prototype.play = function(callback) {
    "use strict";

    this.callback = callback;
};

Looper.prototype.stop = function() {
    "use strict";

    this.callback = false;
};

Looper.prototype.tick = function() {
    "use strict";

    PassThroughNode.prototype.tick.call(this);

    this.time += 1;
    this.seconds = this.time / this.audiolet.device.sampleRate;

    if (this.time >= this.lastBeatTime + this.beatLength) {
        if (this.callback) {
            this.callback();
        }
        this.lastBeatTime += this.beatLength;
    }
};

Looper.prototype.toString = function() {
    "use strict";

    return 'Looper';
};
