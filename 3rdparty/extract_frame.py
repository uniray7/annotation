import json
import cv2
import sys, os
import math

# TODO(Ray): because whenever new a videoCapture instance, Gstreamer(C lib) 
# always deliver error through stderr
# , it will result real error in pyRun in extractFrame.js
# it is just a workaround
null_fd = os.open(os.devnull, os.O_RDWR)
os.dup2(null_fd, 2)


def extract_frame(media_id, video_path, dest_dir, fps):
    video = cv2.VideoCapture(video_path)
    if not video.isOpened():
        print(json.dumps({'error': 'video not opened'}))
        video.release()
        sys.exit(0)
    dest_dir = os.path.join(dest_dir, media_id)
    if not os.path.exists(dest_dir):
        os.makedirs(dest_dir)

    ori_fps = video.get(cv2.CAP_PROP_FPS)
    frame_rate = math.floor(int(ori_fps)/int(fps))
    frame_counter = 0
    filenames = []
    while(video.isOpened()):
        success, frame = video.read()
        if not success:
            break
        frame_id = video.get(1)
        if frame_id%frame_rate == 0:
            filename = str(frame_counter)+'.png'
            frame_path = os.path.join(dest_dir, filename)
            filenames.append(filename)
            cv2.imwrite(frame_path, frame)
            frame_counter = frame_counter + 1
    result = {}
    result['mediaId'] = media_id
    result['filenames'] = filenames
    print(json.dumps(result))

    video.release()

extract_frame(sys.argv[1], sys.argv[2], sys.argv[3],  sys.argv[4])
