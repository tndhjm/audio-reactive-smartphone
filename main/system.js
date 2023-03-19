window.AudioContext = window.AudioContext || window.webkitAudioContext;

let context;
let analyser;

let background = document.getElementById("background");

let spectrum;

let hzSize, pointArrayNum1, pointArrayNum2;
let limit, limitArray;
let minRange, maxRange, rangeSum, rangeAverage;
let mindb, maxdb;

// ~13000Hz程度までをFFTする範囲
limit = 13000;

// 平均音量を取得する周波数範囲の最小値
minRange = 6000;
// 平均音量を取得する周波数範囲の最大値
maxRange = 8500;
rangeAverage = 0;

//画面を黒から白に点滅させる閾値の範囲ｓ
maxdb = -70;
mindb = -80;

let unit;

background.addEventListener('click', async () => {
    //domの削除
    document.getElementById("infos").style.display='none';

    context = new AudioContext();
    analyser = context.createAnalyser();

    const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true
    });

    const input  = context.createMediaStreamSource(stream);
    input.connect(analyser);
    
    analyser.fftSize = 256;
    spectrum = new Float32Array(analyser.frequencyBinCount);

    clicked = true;

    //band帯を取得
    hzSize = context.sampleRate/analyser.fftSize;
    limitArray = Math.floor(limit/hzSize);
    pointArrayNum1 = Math.floor(minRange/hzSize)-1;
    pointArrayNum2 = Math.floor(maxRange/hzSize)-1;

    window.requestAnimationFrame(loop);
});

// map reference
// https://qiita.com/uto-usui/items/2e29777c6fffffc7519d
// @uto-usui

const map = (value, start1, stop1, start2, stop2) => {
    let result = 0;
  
    result = (value <= start1)
      ? start2 : (value >= stop1)
        ? stop2 : (() => {
  
          let ratio = (stop2 - start2) / (stop1 - start1);
          return (value - start1) * ratio + start2;
  
        })();
  
    return result;
};

const loop = () => {
    rangeSum = 0;

    if(clicked) {
        analyser.getFloatFrequencyData(spectrum);
        
        for (let i = pointArrayNum1; i <= pointArrayNum2; i++){
            rangeSum += spectrum[i];
        }

        rangeAverage = rangeSum/(pointArrayNum2-pointArrayNum1);

        if(rangeAverage >= mindb) {
            unit = map(rangeAverage, mindb, maxdb, 0, 1);
            let backColor = (map(unit*unit*unit*unit), 0, 1, 0, 255);
            background.style.backgroundColor = "rgb( " + backColor + "," + backColor + "," + backColor + " )";
        }
        else { background.style.backgroundColor = "black"; }
    }


    window.requestAnimationFrame(loop);
};
