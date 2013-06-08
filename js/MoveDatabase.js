window.MoveDatabase = function(initialState){
   var moveIDs = [];
   var moveHistory = [];
   var stateHistory = [initialState];
   function applyMove(dicMove,dicState){
      moveIDs.push(dicMove['moveId']);
      moveHistory.push(dicMove);
      stateHistory.push(dicState);
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
   function isMoveMissing(){
      for(var i=0;i<moveHistory.length;i++){
         var iLastMoveId = moveHistory[i]['lastMoveId'];
         if(iLastMoveId !== undefined && iLastMoveId !== null && !moveIDs.contains(iLastMoveId)){
            return true;
         }
      }
      return false;
   }
   this.applyMove = applyMove;
   this.getMovesAfterStep = getMovesAfterStep;
   this.rollbackToStep = rollbackToStep;
   this.getCurrentState = getCurrentState;
   this.getTimeStep = getTimeStep;
   this.isMoveMissing = isMoveMissing;
}
