<script setup lang="ts">
import { ref } from "vue";
import { TheChessboard } from "vue3-chessboard";
import "vue3-chessboard/style.css";
import type { ChessboardAPI, BoardConfig } from "vue3-chessboard";
import { Chess, type Square } from "chess.js";

const boardAPI = ref<ChessboardAPI>();
const boardConfig: BoardConfig = {
  coordinates: false,
  viewOnly: true,
};

const chess = new Chess();
const pgn = ref(
  "1. e4 e5 {king's pawn opening} 2. Nf3 Nc6 3. Bc4 Bc5 {giuoco piano} *"
);
chess.loadPgn(
  "1. e4 e5 {king's pawn opening} 2. Nf3 Nc6 3. Bc4 Bc5 {giuoco piano} *"
);
const history = chess.history({ verbose: true });
var index: number = 0;
const max = history.length;
var isNextDisabled = ref(false);
var isPrevDisabled = ref(true);
console.log(chess.getComment());

function handleCheckmate(isMated: string) {
  if (isMated === "w") {
    alert("Black wins!");
  } else {
    alert("White wins!");
  }
}

function reset() {
  index = 0;
  boardAPI.value?.resetBoard();
  isNextDisabled.value = false;
  isPrevDisabled.value = true;
}

function lastMove() {
  boardAPI.value?.undoLastMove();
  if (index === 0) {
    isPrevDisabled.value = true;
    isNextDisabled.value = false;
    return;
  }
  index = index - 1;
}

function nextMove() {
  isPrevDisabled.value = false;
  var fromSquare = <Square>history[index].from;
  var toSquare = <Square>history[index].to;
  boardAPI.value?.makeMove(fromSquare, toSquare);
  if (index < max - 1) {
    index = index + 1;
  } else {
    isNextDisabled.value = true;
  }
}
</script>

<template>
  <div class="container mt-5 d-flex">
    <Card class="chess">
      <template #title> Přehrání partie </template>
      <template #content>
        <div class="d-flex justify-content-between">
          <div class="chessboard">
            <TheChessboard
              :board-config="boardConfig"
              @board-created="(api) => (boardAPI = api)"
              @checkmate="handleCheckmate"
            />
          </div>
          <div class="board-controls-pgn">
            <Button @click="boardAPI?.board.toggleOrientation()">
              Prohodit strany
            </Button>
            <Button @click="reset()">Reset</Button>
            <Button :disabled="isPrevDisabled" @click="lastMove()">
              Předchozí
            </Button>
            <Button :disabled="isNextDisabled" @click="nextMove()">
              Další
            </Button>
            {{}}
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>
