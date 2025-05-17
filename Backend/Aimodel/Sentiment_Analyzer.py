from joblib import load
import json
import sys
import sklearn
DIRNAME = sys.path
my_pipeline = load(DIRNAME[0]+'/saves/pipeline.joblib')
model = load(DIRNAME[0]+'/saves/model.joblib')


def sol_transform(solns):
    sol = []
    for i in solns:
        if i == 0:
            sol.append('Negative')
        else:
            sol.append('Positive')
    return sol
def req(input_data):
    refined_data = my_pipeline.transform(input_data)
    predictions = model.predict(refined_data)
    predictions = sol_transform(predictions)
    return predictions
def main():
    try:
        data = sys.stdin.read()
        print(data)

        input_data = json.loads(data)
        output_data = req([input_data])

        output_data = output_data
        print(output_data)   
        sys.exit(0)
    except json.JSONDecodeError as e:
        print("error : ",e)
    except Exception as e:
        print("An error occurred:", e)
        sys.exit(1)

if __name__=='__main__':
    main()
# print(req(['hellow']))
