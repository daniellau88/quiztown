from __future__ import annotations

import os

from dataclasses import asdict, dataclass
from shutil import copyfile

from paddleocr import PaddleOCR

from quiztown.common.errors import ApplicationError, ErrorCode

from .models import Card

ocr = PaddleOCR(lang="en", use_gpu=False,
                det_model_dir="paddle_ocr/ch_ppocr_server_v2.0_det_infer/",
                cls_model_dir="paddle_ocr/ch_ppocr_mobile_v2.0_cls_infer/",
                rec_model_dir="paddle_ocr/ch_ppocr_server_v2.0_rec_infer/",
                rec_char_dict_path="paddle_ocr/ppocr_keys_v1.txt",
                use_angle_cls=True,
                show_log=False)


MIN_NUM_RESULTS_IN_IMAGE = 2
MIN_CONFIDENCE = 0.5
STATIC_CARD_DIRECTORY = "static/cards/"
UPLOAD_DIRECTORY = "uploads/"

if not os.path.exists("paddle_ocr/ch_ppocr_server_v2.0_det_infer") or \
        not os.path.exists("paddle_ocr/ch_ppocr_mobile_v2.0_cls_infer") or \
        not os.path.exists("paddle_ocr/ch_ppocr_server_v2.0_rec_infer"):
    raise Exception(
        "Please download required files for Paddle OCR according to README.MD")


@dataclass
class PaddleOCRResult():
    # Top left and bottom right coordinate
    bounding_box: tuple[tuple[int, int], tuple[int, int]]
    text: str
    confidence: float

    def __repr__(self):
        return "%s, text: %s, confidence: %f" % (
            str(self.bounding_box),
            self.text,
            self.confidence,
        )


def import_card_from_image(image_key: str, collection_id: int, name: str = ""):
    if not os.path.isfile(STATIC_CARD_DIRECTORY + image_key):
        if not os.path.isfile(UPLOAD_DIRECTORY + image_key):
            raise ApplicationError(ErrorCode.NOT_FOUND, ["File not found"])
        copyfile(UPLOAD_DIRECTORY + image_key, STATIC_CARD_DIRECTORY + image_key)

    paddle_ocr_results = get_paddle_ocr_text_bounding_boxes_from_image(
        STATIC_CARD_DIRECTORY + image_key)

    filtered_results = list(filter(lambda x: x.confidence >
                                   MIN_CONFIDENCE, paddle_ocr_results))
    if len(filtered_results) < MIN_NUM_RESULTS_IN_IMAGE:
        return

    json_results = [asdict(result) for result in filtered_results]

    card = Card(name=name, collection_id=collection_id,
                image_file_key=image_key, answer_details={"results": json_results})
    card.save()

    return card


def get_paddle_ocr_text_bounding_boxes_from_image(image_file_path: str) -> list:
    result = ocr.ocr(image_file_path)

    def convert_box_coordinate_to_top_left_bottom_right(
            box_coordinate: list[list[float]]) -> tuple[tuple[int, int], tuple[int, int]]:
        top_left_x = int(box_coordinate[0][0])
        top_left_y = int(box_coordinate[0][1])
        bottom_right_x = int(box_coordinate[2][0])
        bottom_right_y = int(box_coordinate[2][1])
        return ((top_left_x, top_left_y), (bottom_right_x, bottom_right_y))

    # (bounding_box, text, confidence)
    def convert_result_row_to_object(result_row):
        return PaddleOCRResult(convert_box_coordinate_to_top_left_bottom_right(
            result_row[0]), result_row[1][0], result_row[1][1])

    if result is None:
        return []

    return [convert_result_row_to_object(result_row) for result_row in result]
