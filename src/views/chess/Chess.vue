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

let chess = new Chess();
const pgn = ref(
  "1. e4 e5 {king's pawn opening} 2. Nf3 Nc6 {aaa} 3. Bc4 Bc5 {giuoco piano} *"
);
chess.loadPgn(pgn.value);
let allComments = chess.getComments();
const currentComment = ref<string>();
const currentFen = ref<string>();
console.log(chess.getComments());
let history = chess.history({ verbose: true });
console.log(history);

var index: number = 0;
let max = history.length;
var isNextDisabled = ref(false);
var isPrevDisabled = ref(true);
chess.reset();
currentFen.value = chess.fen();

function handleCheckmate(isMated: string) {
  if (isMated === "w") {
    console.log("Black wins!");
    alert("Black wins!");
  } else {
    console.log("White wins!");
    alert("White wins!");
  }
}

function reset() {
  index = 0;
  boardAPI.value?.resetBoard();
  chess.reset();
  isNextDisabled.value = false;
  isPrevDisabled.value = true;
  currentComment.value = undefined;
}

function lastMove() {
  isNextDisabled.value = false;
  boardAPI.value?.undoLastMove();
  chess.undo();
  currentFen.value = chess.fen();
  currentComment.value = allComments.find(
    (comment) => comment.fen === currentFen.value
  )?.comment;
  console.log(index);
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
  chess.move({ from: fromSquare, to: toSquare });
  currentFen.value = chess.fen();
  currentComment.value = allComments.find(
    (comment) => comment.fen === currentFen.value
  )?.comment;
  if (index < max - 1) {
    index = index + 1;
  } else {
    isNextDisabled.value = true;
  }
  if (chess.isGameOver()) {
    console.log("game over");
  }
}

function loadNewPgn(): void {
  chess.loadPgn(pgn.value);
  allComments = chess.getComments();
  history = chess.history({ verbose: true });
  max = history.length;
  console.log(history);
  console.log("clicked");
  reset();
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
            <Divider></Divider>
            {{ currentComment }}
            <Divider></Divider>
            <h5>PGN k přehrání</h5>
            <Textarea
              id="load-pgn"
              type="text"
              cols="50"
              :autoResize="true"
              v-model="pgn"
            />
            <Button @click="loadNewPgn()">Nahrát</Button>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<style>
.board-controls-pgn {
  margin: 5px;
}
.board-controls-pgn Button {
  margin: 2px;
}
</style>
