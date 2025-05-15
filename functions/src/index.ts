import {initializeApp} from "firebase-admin/app";
import {getMessaging} from "firebase-admin/messaging";
import {onDocumentWritten} from "firebase-functions/v2/firestore";
import {getFirestore} from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

export const notifyOnGameChange = onDocumentWritten(
  {document: "games/{gameId}", region: "europe-west1"},
  async (event) => {
    const after = event.data?.after?.data();
    if (!after) return;

    const payload = {
      notification: {
        title: "Datos actualizados",
        body: `Se modificó el juego “${after.name ?? "sin nombre"}”.`,
      },
      data: {gameId: event.params.gameId},
    };

    const snap = await db.collection("tokens").get();
    const tokens = snap.docs.map((d) => d.id);

    if (tokens.length) {
      await getMessaging().sendEachForMulticast({tokens, ...payload});
    }
  },
);
