import face_recognition
import numpy as np
import sys

class FaceRecognition:

    def __init__(self):
        self.known_face_encodings = []
        self.known_face_names = [ "kylo", "leia", "rey", "luke", "anakin"]
        for name in self.known_face_names:
            print('#')
            img = face_recognition.load_image_file("users/" + name + ".png")
            enc = face_recognition.face_encodings(img)[0]
            self.known_face_encodings.append(enc)

    def match_person_in_image(self, img):
        """match_person_in_image tries to find a user from the predefined list in the given input picture.
        If a person was recognized and matched, then the person's name is returned as a string.
        If a person was recognized but not matched, then an empty string is returned.
        If no person was recognized, the return value is None."""
        
        # Find all the faces and face encodings in the current frame of video
        face_locations = face_recognition.face_locations(img)
        face_encodings = face_recognition.face_encodings(img, face_locations)

        for face_encoding in face_encodings:
            # See if the face is a match for the known face(s)
            matches = face_recognition.compare_faces(self.known_face_encodings, face_encoding)

            # If a match was found in known_face_encodings, just use the first one.
            if True in matches:
                first_match_index = matches.index(True)
                name = self.known_face_names[first_match_index]
                return name

            # Or instead, use the known face with the smallest distance to the new face
            # face_distances = face_recognition.face_distance(self.known_face_encodings, face_encoding)
            # best_match_index = np.argmin(face_distances)
            # if matches[best_match_index]:
            #    name = self.known_face_names[best_match_index]
            return "unkown"

        return None
