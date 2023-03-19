window.AudioContext = window.AudioContext || window.webkitAudioContext;

// Create the instance of AudioContext
let context;

// Create the instance of AnalyserNode
let analyser;
let spectrum;

let clicked = false;

let hzSize, pointArrayNum1, pointArrayNum2;
let limit, limitArray;
let border;
let minRange, maxRange, rangeSum, rangeAvarage; 
let mindb, maxdb;
let count = 1;

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);

    // background(0);
    stroke(255);
    strokeWeight(2);
    noFill();   

    // 画面上に表示する任意閾値
    border = -70;

    // ~13000Hz程度までをFFTする範囲
    limit = 13000;

    // 平均音量を取得する周波数範囲の最小値
    minRange = 6000;
    // 平均音量を取得する周波数範囲の最大値
    maxRange = 8500;
    rangeAverage = 0;

    maxdb = -300;

    textSize(10);

    addEventListener('click', async () => {
        context = new AudioContext();
        analyser = context.createAnalyser();

        const stream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true
        });
    
        const input  = context.createMediaStreamSource(stream);
        input.connect(analyser);
    
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        spectrum = new Float32Array(bufferLength);
    
        clicked = true;
    
        //band帯を取得
        hzSize = context.sampleRate/analyser.fftSize;
        limitArray = Math.floor(limit/hzSize);
        pointArrayNum1 = Math.floor(minRange/hzSize)-1;
        pointArrayNum2 = Math.floor(maxRange/hzSize)-1;
    });
}

function draw() {
    background(0);
    
    rangeSum = 0;
    if(clicked) {
        textAlign(LEFT);

        //周波数ごとの音量を取得
        analyser.getFloatFrequencyData(spectrum);
        
        for (let i = 0; i <= limitArray; i++){
            strokeWeight(2);
            stroke(255);

            if(i >= pointArrayNum1 && i <= pointArrayNum2) {
                console.log(spectrum[i]);
                rangeSum += spectrum[i];
                stroke(255, 0, 0);
            }

            let x = map(i, 0, limitArray, 5, width-5);
            let h = map(spectrum[i], -127, 0, height, 0);
            line(x, height, x, h);

            noStroke();
            fill(255, 0, 0);
            text(i*hzSize + "~" + (i+1)*hzSize, x, 20+10*count);
            count++;
        }
        count = 1;

        rangeAvarage = rangeSum/(pointArrayNum2-pointArrayNum1);
        if(rangeAvarage > maxdb) maxdb = rangeAvarage;

        strokeWeight(50);
        stroke(0, 255, 0)
        line(width/2, height, width/2, map(rangeAvarage, -127, 0, height, 0));
        noStroke();
        fill(255, 0, 0);
        text(minRange + "~" + maxRange + "Average:" + rangeAvarage, 20, 20);

        textAlign(RIGHT);
        text("maxHz:" + maxdb, width-20, 20);

        stroke(255);
        strokeWeight(2);
        line(0,  map(border, -127, 0, height, 0), width,  map(border, -127, 0, height, 0));
    }
    else {
        background(0);
    }
}
