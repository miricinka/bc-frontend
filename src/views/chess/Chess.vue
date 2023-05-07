<script setup lang="ts">
import { onMounted, ref } from "vue";
import { TheChessboard } from "vue3-chessboard";
import "vue3-chessboard/style.css";
import type { ChessboardAPI, BoardConfig } from "vue3-chessboard";
import { Chess, type Move, type Square } from "chess.js";
import axios from "axios";
import type { IGame } from "@/shared/interface";
import { useToast } from "primevue/usetoast";
import router from "@/router";

const toast = useToast();

const token = ref(localStorage.getItem("token"));

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
const PGNError = ref<boolean>(false);

/**
 * if there is a specific id for chess game
 * checks if user is logged in to view
 * or redirects to page not found
 */
onMounted(() => {
  if (props.id) {
    if (!token.value) {
      router.push("/pageNotFound");
    }
    getGame(props.id);
  }
});

chess.loadPgn(pgn.value);
let allComments = chess.getComments();
const currentComment = ref<string>();
const currentFen = ref<string>();
history.value = chess.history({ verbose: true });

const index = ref<number>(0);
let max = history.value.length;
var isNextDisabled = ref(false);
var isPrevDisabled = ref(true);
chess.reset();
currentFen.value = chess.fen();

/**
 *
 * gets specific game from server
 * and loads it to abstract game
 * @param id
 */
async function getGame(id: string) {
  const response = await axios<IGame>({
    method: "get",
    url: "http://127.0.0.1:8000/api/game/" + id,
    headers: { Authorization: `Bearer ${token.value}` },
  });
  game.value = response.data;
  pgn.value = game.value.pgn;
  loadNewPgn();
}

/**
 * handles reset game triggered by user
 */
function reset() {
  index.value = 0;
  boardAPI.value?.resetBoard();
  chess.reset();
  isNextDisabled.value = false;
  isPrevDisabled.value = true;
  currentComment.value = undefined;
}

/**
 * handles last move triggered by user
 */
function lastMove() {
  isNextDisabled.value = false;
  boardAPI.value?.undoLastMove();
  chess.undo();
  currentFen.value = chess.fen();
  currentComment.value = allComments.find(
    (comment) => comment.fen === currentFen.value
  )?.comment;
  index.value = index.value - 1;
  if (index.value === 0) {
    isPrevDisabled.value = true;
    isNextDisabled.value = false;
    return;
  }
  console.log(index.value);
}

/**
 * handles next move triggered by user
 */
function nextMove() {
  isPrevDisabled.value = false;
  if (history.value) {
    var fromSquare = <Square>history.value[index.value].from;
    var toSquare = <Square>history.value[index.value].to;
    boardAPI.value?.makeMove(fromSquare, toSquare);
    chess.move({ from: fromSquare, to: toSquare });
    currentFen.value = chess.fen();
    currentComment.value = allComments.find(
      (comment) => comment.fen === currentFen.value
    )?.comment;
    if (index.value < max) {
      index.value = index.value + 1;
    }
    if (index.value === max) {
      isNextDisabled.value = true;
    }
    console.log(index.value);
  }
}

/**
 * tries to load new pgn to abstract game
 * displays success/error notification
 * parses comments
 */
function loadNewPgn(): void {
  try {
    chess.loadPgn(pgn.value);
  } catch {
    toast.add({
      severity: "error",
      summary: "Chyba",
      detail: "PGN se nepodařilo načíst",
      life: 3000,
    });
    PGNError.value = true;
    return;
  }

  toast.add({
    severity: "success",
    summary: "PGN",
    detail: "Nové PGN načteno",
    life: 3000,
  });
  PGNError.value = false;

  allComments = chess.getComments();
  history.value = chess.history({ verbose: true });
  max = history.value.length;
  console.log(history);
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
              cols="40"
              v-model="pgn"
              :class="`${PGNError ? 'p-invalid' : ''}`"
            />
            <div v-if="PGNError">
              <small id="pgn-error" class="p-error">Invalid PGN file.</small>
            </div>
            <Button @click="loadNewPgn()">Nahrát</Button>
            <Divider></Divider>
            <div class="comment">
              <h5>Komentář</h5>
              <span>
                {{ currentComment }}
              </span>
            </div>
            <Divider></Divider>
            <div class="moves">
              <h5>Tahy</h5>
              <template v-for="(move, moveIndex) in history">
                <span v-if="(moveIndex + 1) % 2" class="sec">
                  {{ moveIndex / 2 + 1 }}.
                </span>
                <span v-if="index === moveIndex + 1" class="move higlighted">{{
                  move.san + " "
                }}</span>
                <span v-else class="move">{{ move.san + " " }}</span>
                <br v-if="moveIndex % 2" />
              </template>
            </div>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<style>
div.chessboard div.main-board {
  cursor: default !important;
}
.board-controls-pgn {
  margin: 5px;
}
.board-controls-pgn Button {
  margin: 2px;
}

span.move {
  border-radius: 15%;
  padding: 4px;
  margin: 1px;
}

span.higlighted {
  background-color: #ffc107;
}

.comment {
  height: 80px;
}
</style>
