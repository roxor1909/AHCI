import face_recognition
import numpy as np
import sys

class FaceRecognition:

    def __init__(self):
        self.known_face_encodings = []
        self.known_face_names = [ "kylo", "leia", "rey", "luke", "anakin"]
        for name in self.known_face_names:
            print(f"loading face for {name}", file=sys.stderr)
            img = face_recognition.load_image_file("users/" + name + ".png")
            enc = face_recognition.face_encodings(img)[0]
            self.known_face_encodings.append(enc)

    def match_person_in_image(self, img):
        """match_person_in_image tries to find a user from the predefined list in the given input picture.
        If a person was recognized and matched, then the person's name and its bounding box are returned.
        If a person was recognized but not matched, then name 'unknown' is returned.
        If no person was recognized, then the return value is None."""
        
        # Find all the faces and face encodings in the current frame of video
        face_locations = face_recognition.face_locations(img)
        face_encodings = face_recognition.face_encodings(img, face_locations)

        for (top, right, bottom, left),face_encoding in zip(face_locations,face_encodings):

            # See if the face is a match for the known face(s)            
            matches = face_recognition.compare_faces(self.known_face_encodings, face_encoding)

            # If a match was found in known_face_encodings, just use the first one.
            if True in matches:
                first_match_index = matches.index(True)
                name = self.known_face_names[first_match_index]
                return { 'name': name, 'boundingBox': { 'top': top, 'right': right, 'bottom': bottom, 'left': left } }

            return { 'name': 'unknown', 'boundingBox': { 'top': top, 'right': right, 'bottom': bottom, 'left': left } }

        return { 'name': None }