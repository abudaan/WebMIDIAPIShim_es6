'use strict';

import {inNodeJs} from './util';

const jazzPluginInitTime = 100; // milliseconds

let jazzInstanceNumber = 0;
let jazzInstances = new Map();

export function createJazzInstance(callback){

  let id = 'jazz_' + jazzInstanceNumber++ + '' + Date.now();
  let instance;
  let objRef, activeX;

  if(inNodeJs === true){
    objRef = new window.jazzMidi.MIDI();
  }else{
    let o1 = document.createElement('object');
    o1.id = id + 'ie';
    o1.classid = 'CLSID:1ACE1618-1C7D-4561-AEE1-34842AA85E90';
    activeX = o1;

    let o2 = document.createElement('object');
    o2.id = id;
    o2.type = 'audio/x-jazz';
    o1.appendChild(o2);
    objRef = o2;

    let e = document.createElement('p');
    e.appendChild(document.createTextNode('This page requires the '));

    let a = document.createElement('a');
    a.appendChild(document.createTextNode('Jazz plugin'));
    a.href = 'http://jazz-soft.net/';

    e.appendChild(a);
    e.appendChild(document.createTextNode('.'));
    o2.appendChild(e);

    let insertionPoint = document.getElementById('MIDIPlugin');
    if(!insertionPoint) {
      // Create hidden element
      insertionPoint = document.createElement('div');
      insertionPoint.id = 'MIDIPlugin';
      insertionPoint.style.position = 'absolute';
      insertionPoint.style.visibility = 'hidden';
      insertionPoint.style.left = '-9999px';
      insertionPoint.style.top = '-9999px';
      document.body.appendChild(insertionPoint);
    }
    insertionPoint.appendChild(o1);
  }


  setTimeout(function(){
    if(objRef.isJazz === true){
      instance = objRef;
    }else if(activeX.isJazz === true){
      instance = activeX;
    }
    if(instance !== undefined){
      instance._perfTimeZero = window.performance.now();
      jazzInstances.set(id, instance);
    }
    callback(instance);
  }, jazzPluginInitTime);
}


export function getJazzInstance(type, callback){
  let instance = null;
  let key = type === 'input' ? 'inputInUse' : 'outputInUse';

  for(let inst of jazzInstances.values()){
    if(inst[key] !== true){
        instance = inst;
        break;
    }
  }

  if(instance === null){
    createJazzInstance(callback);
  }else{
    callback(instance);
  }
}
