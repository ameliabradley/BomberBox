/**
 * Copyright © 2012-2013 Tim Bradley 
 * All Rights Reserved
 * 
 * NOTICE: All information herein is, and remains the property of
 * Tim Bradley. Dissemation of this information or reproduction of
 * this material is strictly forbidden unless prior written permission
 * is obtained from Tim Bradley.
 * 
 * The above copyright notice and this notice shall be included in
 * all copies or substantial portions of Tim's modifications to the Software.
 */
"use strict";
window.MoveDatabase = function(options){

   validateOptions(options);

   function validateOptions(options){
      if(typeof options !== 'object'){
         throw '[MoveDatabase] options argument should be a plain Javascript object.';
      }
      var requiredOptions = [
         // 
         // [Type, Name, [Params]]
         //
         // Game State
         ['object','initialState'],
         // Return Move ID (number) or null
         ['function','getMoveID',['move']],
         // Return Previous Move ID (number) or null
         ['function','getLastMoveID',['move']],
         // Retrieve the missing move information, then feed the move into the given callback
         ['function','getMissedMove',['lastMoveID','fCallback']],
         // Execute the action associated withthe given move, *NOT* including any call to applyMove.
         ['function','executeMoveAction',['move','oldState']]
      ];
      var missingOptions = [];
      for(var i=0;i<requiredOptions.length;i++){
         if(!options.hasOwnProperty(requiredOptions[i][1]) || typeof options[requiredOptions[i][1]] !== requiredOptions[i][0]){
            missingOptions.push(requiredOptions[i][0]+' '+requiredOptions[i][1]+(requiredOptions[i][2]?'('+requiredOptions[i][2].join(',')+')':''));
         }
      }
      if(missingOptions.length > 0){
         throw '[MoveDatabase] missing option(s):'+missingOptions.join('; ');
      }
   }
   function getMoveID(move){return options.getMoveID(move);}
   function getLastMoveID(move){return options.getLastMoveID(move);}
   function getMissedMove(iLastMoveID,fSuccessCallback){
      if(iLastMoveID === null) {
         fSuccessCallback();
         return;
      } else {
         return options.getMissedMove(iLastMoveID,fSuccessCallback);
      }
   }
   function executeMoveAction(iLastMoveID, oldState){return options.executeMoveAction(iLastMoveID, oldState);}

   var aMoveIDs = [];
   var moveHistory = [];
   var stateHistory = [options.initialState];

   function applyMove(dicMove,dicState){
      var iLastMoveID = getLastMoveID(dicMove);
      if(iLastMoveID !== null && isMoveMissing(iLastMoveID)){
         var iTimeStep = getTimeStep(iLastMoveID);
         var aMovesAfter = getMovesAfterStep(iTimeStep);
         aMovesAfter.push(dicMove);
         rollbackToStep(iTimeStep);
         var oldState = stateHistory[stateHistory.length-1];

         getMissedMove(iLastMoveID,function(missedMove){
            if(missedMove !== undefined && missedMove !== null){
               aMovesAfter.unshift(missedMove);
            }
            for(var i=0;i<aMovesAfter.length;i++){
               executeMoveAction(aMovesAfter[i], oldState);
               moveDB.applyMove(aMovesAfter[i]);
            }
         });
      } else {
         aMoveIDs.push(getMoveID(dicMove));
         moveHistory.push(dicMove);
         stateHistory.push(dicState);
      }
   }
   function getTimeStep(iMoveID){
      if(aMoveIDs.indexOf(iMoveID) !== -1){
         var iIndex = aMoveIDs.indexOf(iMoveID);
         if(iIndex > 0) return iIndex;
         else return 0;
      } else if(aMoveIDs.length > 0){
         for(var i=0;i<aMoveIDs.length;i++){
            if(iMoveID > aMoveIDs[i]) return i+1;
         }
      } else {
         return 0;
      }
   }
   function getMovesAfterStep(iTimeStep){
      return moveHistory.slice(iTimeStep);
   }
   function rollbackToStep(iTimeStep){
      stateHistory.length = iTimeStep+1;
      moveHistory.length = iTimeStep;
   }
   function getCurrentState(){
      return stateHistory.peek();
   }
   function getTimeStep(){
      return moveHistory.length;
   }
   function isMoveMissing(iMissingMoveID){
      return aMoveIDs.indexOf(iMissingMoveID) === -1;
   }
   function dumpDataBase(){
      return JSON.stringify(aMoveIDs)+"\n"+
      JSON.stringify(moveHistory)+"\n"+
      JSON.stringify(stateHistory);
   }
   this.applyMove = applyMove;
   this.dumpDataBase = dumpDataBase;
}
