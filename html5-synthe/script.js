'use strict';

///////////////////////////////////////////////

///////////////////////////////////////////////

var rangeValue = function (input, output) {
  return function(evt){
    output.innerHTML = input.value;
  }
}

  var osc2_in_dis = document.getElementById('osc2_detune_cur');
  var osc2_in_val = document.getElementById('osc2_dt_val');
  osc2_in_dis.addEventListener('input', rangeValue(osc2_in_dis, osc2_in_val));

  var volume_dis = document.getElementById('volume');
  var volume_val = document.getElementById('volume_val');
  volume_dis.addEventListener('input', rangeValue(volume_dis, volume_val));

  var attack_dis = document.getElementById('attack');
  var attack_val = document.getElementById('attack_val');
  attack_dis.addEventListener('input', rangeValue(attack_dis, attack_val));

  var release_dis = document.getElementById('release');
  var release_val = document.getElementById('release_val');
  release_dis.addEventListener('input', rangeValue(release_dis, release_val));
  
  var delay_vol_dis = document.getElementById('delay_vol');
  var delay_vol_val = document.getElementById('delay_vol_val');
  delay_vol_dis.addEventListener('input', rangeValue(delay_vol_dis, delay_vol_val));
  
  var delay_time_dis = document.getElementById('delay_time');
  var deley_time_val = document.getElementById('delay_time_val');
  delay_time_dis.addEventListener('input', rangeValue(delay_time_dis, delay_time_val));
  

///////////////////////////////////////////////

// Web Audio APIを利用するためのインスタンス生成
var audioContext = new AudioContext();
// キーごとにMIDIノートナンバーを割り振る
var keymap = {
  // Zキー = C4
  90: 60,
  // Sキー = C#4
  83: 61,
  // Xキー = D4
  88: 62,
  // Dキー = D#4
  68: 63,
  // Cキー = E4
  67: 64,
  // Vキー = F4
  86: 65,
  // Gキー = F#4
  71: 66,
  // Bキー = G4
  66: 67,
  // Hキー = G#4
  72: 68,
  // Nキー = A4
  78: 69,
  // Jキー = A#4
  74: 70,
  // Mキー = B4
  77: 71,
  // ,キー = C5
  188: 72
};

// キーダウンした際の処理
//document.onkeydown = function(keyDownEvent) {
//}


function sound_release(){
    var caller = sound_release.caller ;

}


function synth_sound(e, key_tag){
  var osc2_detune = Number(osc2_in_dis.value);
  var vol_num = Number(volume_dis.value);
  vol_num = vol_num / 100;
  var attack_num = Number(attack_dis.value);
  var rel_num = Number(release_dis.value);
  var delay_vol_num = Number(delay_vol_dis.value);
  delay_vol_num = delay_vol_num /100;
  var delay_time_num = Number(delay_time_dis.value);

  // キー押しっぱなしの状態で発火した場合は、動作を終了する
  //if (keyDownEvent.repeat === true) {
  if (e.repeat === true) {
    return;
  }

  // オシレーターを作成
  var osciillatorNode1 = audioContext.createOscillator();
  var osciillatorNode2 = audioContext.createOscillator();
  // エンベロープジェネレーターを作成
  var envelopeGen1 = audioContext.createGain();
  var envelopeGen2 = audioContext.createGain();

  // Max delay time
  var MAX_DELAY_TIME = 5;  // 5 sec
  // Create the instance of DelayNode
  var delay = audioContext.createDelay(MAX_DELAY_TIME);
  // Set delay time
  //delay.delayTime.value = 1.0;  // 2.5 sec
  delay.delayTime.value = delay_time_num;
  
  // Create the instance of GainNode
  var delayGen = audioContext.createGain();  // for feedback
  //delayGen.gain.value = 0.2;
  delayGen.gain.value = delay_vol_num;
  
  // オシレーターをエンベロープジェネレーターに接続
  osciillatorNode1.connect(envelopeGen1);
  osciillatorNode2.connect(envelopeGen2);
  
  // エンベロープジェネレーターを最終出力に接続
  envelopeGen1.connect(audioContext.destination);
  envelopeGen2.connect(audioContext.destination);

  // エンベロープジェネレーター → delay → feedback → 最終出力に接続
  envelopeGen1.connect(delay);
  envelopeGen2.connect(delay);
  delay.connect(delayGen);
  delayGen.connect(audioContext.destination);
  
  // delay の gain を delay にフィードバック
  delayGen.connect(delay);
  
  //console.log(event.type);
  if (event.type == 'mousedown'){
    var freq = 440.0 * Math.pow(2.0, (key_tag - 69.0) / 12.0);
    //console.log('mousedown');
  }else if(event.type == 'keydown'){
    // MIDIノートナンバーを周波数に変換
    var freq = 440.0 * Math.pow(2.0, (keymap[e.keyCode] - 69.0) / 12.0);
  }

    var freq1 = freq;
    var freq2 = freq + osc2_detune;


  // オシレーターの周波数を決定
  osciillatorNode1.frequency.value = freq1;
  osciillatorNode2.frequency.value = freq2;


  // 現在の時間を取得
  var t1 = audioContext.currentTime;
  
  envelopeGen1.gain.cancelScheduledValues(t1);
  envelopeGen2.gain.cancelScheduledValues(t1);

  envelopeGen1.gain.setValueAtTime(0, t1);
  envelopeGen2.gain.setValueAtTime(0, t1);

  envelopeGen1.gain.linearRampToValueAtTime(vol_num, t1 + attack_num);
  envelopeGen2.gain.linearRampToValueAtTime(vol_num, t1 + attack_num);


    
  // オシレーター動作
  osciillatorNode1.start();
  osciillatorNode2.start();


  //console.log(rel_num);

  // キーを離した際に音が止まるよう、イベントを登録する
  document.addEventListener('keyup', checkKeyUp);

  // キーを離したかどうかチェック
  //function checkKeyUp(keyUpEvent) {
  function checkKeyUp(keyUpEvent) {
  
    // 離したキーが、押下したキーで無い場合は処理を行わない
    //if (keyUpEvent.keyCode !== keyDownEvent.keyCode) {
    if (keyUpEvent.keyCode !== e.keyCode) {
      return;
    }
    sound_release();
  }
  c4.addEventListener('mouseup', sound_release);
  cs4.addEventListener('mouseup', sound_release);
  d4.addEventListener('mouseup', sound_release);
  ds4.addEventListener('mouseup', sound_release);
  e4.addEventListener('mouseup', sound_release);
  f4.addEventListener('mouseup', sound_release);
  fs4.addEventListener('mouseup', sound_release);
  g4.addEventListener('mouseup', sound_release);
  gs4.addEventListener('mouseup', sound_release);
  a4.addEventListener('mouseup', sound_release);
  as4.addEventListener('mouseup', sound_release);
  b4.addEventListener('mouseup', sound_release);
  c5.addEventListener('mouseup', sound_release);

  function sound_release(){
    var release = rel_num;
    var keyUpTime = audioContext.currentTime;
    
    // キーをリリースした後にクリック音がなるのを防ぐため、現在の音量をセットする
    envelopeGen1.gain.setValueAtTime(envelopeGen1.gain.value, keyUpTime);
    envelopeGen2.gain.setValueAtTime(envelopeGen2.gain.value, keyUpTime);
    
    envelopeGen1.gain.linearRampToValueAtTime(0, keyUpTime + release);
    envelopeGen2.gain.linearRampToValueAtTime(0, keyUpTime + release);

    //console.log(envelopeGen1.gain.value);

    // オシレーターを停止する
    osciillatorNode1.stop(keyUpTime + release);
    osciillatorNode2.stop(keyUpTime + release);
    //osciillatorNode1.stop();
    // 自身のイベントを削除
    removeEventListener('keyup', checkKeyUp);
  }
};
///////////////////////////////////////////////

//document.addEventListener("keydown", KeyDownFunc);

var c4 = document.getElementById('c4');
var cs4 = document.getElementById('c#4');
var d4 = document.getElementById('d4');
var ds4 = document.getElementById('d#4');
var e4 = document.getElementById('e4');
var f4 = document.getElementById('f4');
var fs4 = document.getElementById('f#4');
var g4 = document.getElementById('g4');
var gs4 = document.getElementById('g#4');
var a4 = document.getElementById('a4');
var as4 = document.getElementById('a#4');
var b4 = document.getElementById('b4');
var c5 = document.getElementById('c5');


c4.addEventListener('mousedown', function(e){synth_sound(e, 60)},true);
cs4.addEventListener('mousedown', function(e){synth_sound(e, 61)},true);
d4.addEventListener('mousedown', function(e){synth_sound(e, 62)},true);
ds4.addEventListener('mousedown', function(e){synth_sound(e, 63)},true);
e4.addEventListener('mousedown', function(e){synth_sound(e, 64)},true);
f4.addEventListener('mousedown', function(e){synth_sound(e, 65)},true);
fs4.addEventListener('mousedown', function(e){synth_sound(e, 66)},true);
g4.addEventListener('mousedown', function(e){synth_sound(e, 67)},true);
gs4.addEventListener('mousedown', function(e){synth_sound(e, 68)},true);
a4.addEventListener('mousedown', function(e){synth_sound(e, 69)},true);
as4.addEventListener('mousedown', function(e){synth_sound(e, 70)},true);
b4.addEventListener('mousedown', function(e){synth_sound(e, 71)},true);
c5.addEventListener('mousedown', function(e){synth_sound(e, 72)},true);


//c4.addEventListener('mousedown', function(e){synth_sound(e, 60)},true);
/*
c4.addEventListener('click', function(e){synth_sound(e, 60)},true);
cs4.addEventListener('click', function(e){synth_sound(e, 61)},true);
d4.addEventListener('click', function(e){synth_sound(e, 62)},true);
ds4.addEventListener('click', function(e){synth_sound(e, 63)},true);
e4.addEventListener('click', function(e){synth_sound(e, 64)},true);
f4.addEventListener('click', function(e){synth_sound(e, 65)},true);
fs4.addEventListener('click', function(e){synth_sound(e, 66)},true);
g4.addEventListener('click', function(e){synth_sound(e, 67)},true);
gs4.addEventListener('click', function(e){synth_sound(e, 68)},true);
a4.addEventListener('click', function(e){synth_sound(e, 69)},true);
as4.addEventListener('click', function(e){synth_sound(e, 70)},true);
b4.addEventListener('click', function(e){synth_sound(e, 71)},true);
c5.addEventListener('click', function(e){synth_sound(e, 72)},true);
*/


document.addEventListener("keydown", synth_sound);

///////////////////////////////////////////////
window.onload = function () {

    var soundstart = document.getElementById('soundstart');
    soundstart.addEventListener('click', sound_start, false);

}

///////////////////////////////////////////////

function sound_start(){
    //各ノードを生成するためのベースとなるオブジェクト
    window.AudioContext = window.AudioContext||window.webkitAudioContext; //互換対応
    var audioContext = new AudioContext();

    //音の発生源
    var osciillatorNode = audioContext.createOscillator();

    //音の出力
    var audioDestinationNode = audioContext.destination;

    //音の発生源を音の出力装置に接続！
    osciillatorNode.connect(audioDestinationNode);

    //音を鳴らす
    osciillatorNode.start = osciillatorNode.start || osciillatorNode.noteOn; //互換対応
    osciillatorNode.start();

    //音を止める
    setTimeout(function(){
        osciillatorNode.stop();
    },200);
}
