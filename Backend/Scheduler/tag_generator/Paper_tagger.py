import numpy as np
from tensorflow.keras.models import load_model
from sklearn.preprocessing import MultiLabelBinarizer
from keras.saving import register_keras_serializable
from transformers import TFAutoModel,AutoTokenizer
import joblib
import json
import sys

@register_keras_serializable()
def extract_cls_token(inputs):
    input_ids, attention_mask = inputs
    outputs = bert_model(input_ids=input_ids, attention_mask=attention_mask)
    cls_token = outputs.last_hidden_state[:, 0, :]
    return cls_token





model = load_model("Backend/utils/Aimodel/tag_generator/Tagging_model_v1.keras",
 custom_objects={'extract_cls_token': extract_cls_token})
mlb = joblib.load("Backend/utils/Aimodel/tag_generator/mlb.pkl")  

BASE_PATH = "Backend/utils/Aimodel/tag_generator/pipeline/"
tokenizer = AutoTokenizer.from_pretrained(BASE_PATH)
bert_model = TFAutoModel.from_pretrained(BASE_PATH)

def predict_tags(text,top_n=4, threshold=0.24):
    inputs = tokenizer(
        text,
        padding='max_length',
        truncation=True,
        max_length=256,
        return_tensors='tf'
    )
    preds = model.predict({'input_ids': inputs['input_ids'], 'attention_mask': inputs['attention_mask']})
    top_indices = np.argsort(preds[0])[-top_n:][::-1] 
    # pred_tags = (preds > threshold).astype(int)
    binary_output = np.zeros(preds.shape[1], dtype=int)
    binary_output[top_indices] = 1
    tags = mlb.inverse_transform(np.array([binary_output]))[0] 
    # tags = mlb.inverse_transform(binary_output)
    print("OUTPUTS:",tags)
    return tags  
def main():
    try:
        data = sys.stdin.read()
        # print(data)

        input_data = json.loads(data)
        output_data = predict_tags([input_data])
        print(output_data)   
        sys.exit(0)
    except json.JSONDecodeError as e:
        print("error : ",e)
    except Exception as e:
        print("An error occurred:", e)
        sys.exit(1)
        
if __name__=='__main__':
    main()