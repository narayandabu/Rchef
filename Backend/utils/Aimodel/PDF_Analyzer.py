import tensorflow as tf
import json
import sys
model = tf.keras.models.load_model('Backend\Aimodel\model_6_skimlit.keras')
LABELS = ['BACKGROUND', 'CONCLUSIONS', 'METHODS', 'OBJECTIVE', 'RESULTS']

def splitter(strr):
    t = tf.constant(strr.split('.'))
    t = tf.reshape(t, (-1, 1))
    return t.numpy().astype(str).tolist()
def preprocess_data(str_data):
    line_num = tf.range(0,len(str_data))
    false_pred = tf.zeros(len(str_data),dtype=tf.int32)
    predd = tf.data.Dataset.from_tensor_slices((false_pred))
    comb = tf.data.Dataset.from_tensor_slices((str_data,line_num))
    comb = tf.data.Dataset.zip((comb,predd))
    refined_data = comb.batch(32).prefetch(tf.data.AUTOTUNE)    
    return refined_data
def make_pred(refined_data,str_data):
    preds = model.predict(refined_data)
    preds = tf.argmax(preds,axis=1)
    x = 0
    predictions = {
        'BACKGROUND':[],
        'OBJECTIVE':[],
        'METHODS':[],
        'RESULTS':[],
        'CONCLUSIONS':[]
    }
    for i in range(len(preds)):
        for j in str_data[i]:
            predictions[LABELS[preds[i]]].append(j)
        x += 1
    return predictions

def main():
    try:
        data = sys.stdin.readlines()
        print(data)
        input_data = json.loads(data)

        input_data = splitter([input_data])
        refined_data = preprocess_data(input_data)
        preds = make_pred(refined_data,input_data)

        output_data = preds
        print('hellow')
        print(json.dumps(output_data)) 
        sys.exit(0)
    except json.JSONDecodeError as e:
        print("error : ",e)
        sys.exit(0)
    except Exception as e:
        print("An error occurred:", e)
        sys.exit(1)  

if __name__=='__main__':
    main()
# input_data = 'In inverse reinforcement learning (IRL), no reward function is given. Instead, the reward function is inferred given an observed behavior from an expert. The idea is to mimic observed behavior, which is often optimal or close to optimal.[56] One popular IRL paradigm is named maximum entropy inverse reinforcement learning (MaxEnt IRL).[57] MaxEnt IRL estimates the parameters of a linear model of the reward function by maximizing the entropy of the probability distribution of observed trajectories subject to constraints related to matching expected feature counts. Recently it has been shown that MaxEnt IRL is a particular case of a more general framework named random utility inverse reinforcement learning (RU-IRL).[58] RU-IRL is based on random utility theory and Markov decision processes. While prior IRL approaches assume that the apparent random behavior of an observed agent is due to it following a random policy, RU-IRL assumes that the observed agent follows a deterministic policy but randomness in observed behavior is due to the fact that an observer only has partial access to the features the observed agent uses in decision making. The utility function is modeled as a random variable to account for the ignorance of the observer regarding the features the observed agent actually considers in its utility function.'
# input_data = splitter(input_data)
# refined_data = preprocess_data(input_data)
# preds = make_pred(refined_data,input_data)
# output_data = preds
# print(output_data) 
