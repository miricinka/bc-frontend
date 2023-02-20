<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { TheChessboard } from "vue3-chessboard";
import "vue3-chessboard/style.css";
import type { ChessboardAPI, BoardConfig } from "vue3-chessboard";
import { Chess, type Move, type Square } from "chess.js";
import axios from "axios";
import type { IGame } from "@/shared/interface";

interface Props {
  id?: string;
}
const props = defineProps<Props>();

const boardAPI = ref<ChessboardAPI>();
const boardConfig: BoardConfig = {
  coordinates: false,
  viewOnly: true,
};

const game = ref<IGame>();
const history = ref<
  (Move & {
    fen: string;
  })[]
>();
let chess = new Chess();
const pgn = ref(
  "1. e4 e5 {king's pawn opening} 2. Nf3 Nc6 {aaa} 3. Bc4 Bc5 {giuoco piano} *"
);

onMounted(() => {
  if (props.id) {
    getGame(props.id);
  }
});

chess.loadPgn(pgn.value);
let allComments = chess.getComments();
const currentComment = ref<string>();
const currentFen = ref<string>();
history.value = chess.history({ verbose: true });
//historyGlobal.value = history;

var index: number = 0;
let max = history.value.length;
var isNextDisabled = ref(false);
var isPrevDisabled = ref(true);
chess.reset();
currentFen.value = chess.fen();

async function getGame(id: string) {
  const response = await axios.get<IGame>(
    "http://127.0.0.1:8000/api/game/" + id
  );
  game.value = response.data;
  pgn.value = game.value.pgn;
  loadNewPgn();
}

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
  index = index - 1;
  if (index === 0) {
    isPrevDisabled.value = true;
    isNextDisabled.value = false;
    return;
  }
  console.log(index);
}

function nextMove() {
  isPrevDisabled.value = false;
  if (history.value) {
    var fromSquare = <Square>history.value[index].from;
    var toSquare = <Square>history.value[index].to;
    boardAPI.value?.makeMove(fromSquare, toSquare);
    chess.move({ from: fromSquare, to: toSquare });
    currentFen.value = chess.fen();
    currentComment.value = allComments.find(
      (comment) => comment.fen === currentFen.value
    )?.comment;
    if (index < max) {
      index = index + 1;
    }
    if (index === max) {
      isNextDisabled.value = true;
    }
    console.log(index);
  }
}

function loadNewPgn(): void {
  chess.loadPgn(pgn.value);
  allComments = chess.getComments();
  history.value = chess.history({ verbose: true });
  max = history.value.length;
  console.log(history);
  reset();
}

function isHighlighted(moveIndex: number) {
  console.log(moveIndex);
  return index === moveIndex + 1 ? true : false;
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
            <h5>PGN k přehrání</h5>
            <Textarea
              id="load-pgn"
              type="text"
              cols="50"
              :autoResize="true"
              v-model="pgn"
            />
            <Button @click="loadNewPgn()">Nahrát</Button>
            <Divider></Divider>
            <template v-for="(move, moveIndex) in history">
              <span v-if="(moveIndex + 1) % 2" class="sec">
                {{ moveIndex / 2 + 1 }}.
              </span>
              <span v-if="isHighlighted(moveIndex)" class="move higlighted">{{
                move.san + " "
              }}</span>
              <span v-else class="move">{{ move.san + " " }}</span>
              <br v-if="moveIndex % 2" />
            </template>
            <Divider></Divider>
            {{ currentComment }}
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

span.move {
  border-radius: 30%;
  padding: 4px;
  margin: 1px;
}

span.higlighted {
  background-color: #ffc107;
}
</style>
