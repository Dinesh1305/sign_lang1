import cv2
import numpy as np
import mediapipe as mp
import tensorflow as tf

# =====================================================
# 1. LOAD TFLITE MODEL (ONCE)
# =====================================================
print("Loading TFLite action recognition model...")

interpreter = tf.lite.Interpreter(model_path="action.tflite")
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

print("TFLite model loaded successfully")

# =====================================================
# 2. CONSTANTS
# =====================================================
SEQUENCE_LENGTH = 20
SMOOTHING_WINDOW = 6
MIN_CONSISTENT = 4
THRESHOLD = 0.4

actions = np.array(["hello", "thanks", "iloveyou"])

# =====================================================
# 3. MEDIAPIPE SETUP (LOAD ONCE, NOT PER FRAME)
# =====================================================
mp_holistic = mp.solutions.holistic

# ✅ FIX: Initialize this GLOBALLY, not inside predict()
holistic_model = mp_holistic.Holistic(
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# =====================================================
# 4. BUFFERS (Global - Single User Limitation)
# =====================================================
sequence = []
sentence = []
predictions = []

# =====================================================
# 5. MEDIAPIPE HELPER FUNCTIONS
# =====================================================
def mediapipe_detection(image, model):
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image.flags.writeable = False
    results = model.process(image)
    image.flags.writeable = True
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    return image, results


def extract_keypoints(results):
    pose = np.array(
        [[p.x, p.y, p.z, p.visibility]
         for p in results.pose_landmarks.landmark]
    ).flatten() if results.pose_landmarks else np.zeros(33 * 4)

    face = np.array(
        [[f.x, f.y, f.z]
         for f in results.face_landmarks.landmark]
    ).flatten() if results.face_landmarks else np.zeros(468 * 3)

    lh = np.array(
        [[l.x, l.y, l.z]
         for l in results.left_hand_landmarks.landmark]
    ).flatten() if results.left_hand_landmarks else np.zeros(21 * 3)

    rh = np.array(
        [[r.x, r.y, r.z]
         for r in results.right_hand_landmarks.landmark]
    ).flatten() if results.right_hand_landmarks else np.zeros(21 * 3)

    return np.concatenate([pose, face, lh, rh])

# =====================================================
# 6. PREDICTION FUNCTION
# =====================================================
def predict(image_bytes: bytes):
    global sequence, sentence, predictions

    # Decode image bytes
    np_img = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    if frame is None:
        raise ValueError("Invalid image input")

    # ✅ FIX: Use the global holistic_model instance
    image, results = mediapipe_detection(frame, holistic_model)

    keypoints = extract_keypoints(results)
    sequence.append(keypoints)
    sequence[:] = sequence[-SEQUENCE_LENGTH:]

    predicted_action = None
    confidence = 0.0

    if len(sequence) == SEQUENCE_LENGTH:
        input_data = np.expand_dims(sequence, axis=0).astype(np.float32)

        interpreter.set_tensor(
            input_details[0]['index'],
            input_data
        )
        interpreter.invoke()

        res = interpreter.get_tensor(
            output_details[0]['index']
        )[0]

        pred_idx = int(np.argmax(res))
        confidence = float(res[pred_idx])

        predictions.append(pred_idx)
        predictions[:] = predictions[-SMOOTHING_WINDOW:]

        if predictions.count(pred_idx) >= MIN_CONSISTENT and confidence > THRESHOLD:
            action = actions[pred_idx]

            if not sentence or action != sentence[-1]:
                sentence.append(action)

            predicted_action = action

        sentence[:] = sentence[-5:]

    return {
        "prediction": predicted_action,
        "confidence": confidence,
        "sentence": sentence
    }