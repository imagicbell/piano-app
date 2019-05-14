import React from 'react';
import styles from './index.css';

class Keyboard extends React.Component {
  // render() {
  //   return (
  //     <div class="keyboard-container">
  //       {
          
  //       }
  //       <div class="piano-key bkey" v-for="note in Notes" :key="note.keyCode" :data-keyCode = "note.keyCode" v-if="note.type=='black' && note.id >= 36 && note.id <= 40" @click="clickPianoKey($event, note.keyCode)">
  //           <div class="keytip">
  //             <div class="keyname" v-html="note.key" v-show="showKeyName"></div>
  //           </div>
  //         </div>
  //       <div class="piano-key wkey" v-for="note in Notes" :key="note.keyCode" :data-keyCode = "note.keyCode" v-if="note.type=='white'" @click="clickPianoKey($event, note.keyCode)">
  //         <div class="keytip">
  //           <div class="keyname" v-show="showKeyName">{{note.key}}</div>
  //           <div class="notename" v-show="showNoteName">{{note.name}}</div>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }
}