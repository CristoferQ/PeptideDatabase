from flask import Flask, jsonify, request
import service1
import service3
import service4
import service5
app = Flask(__name__) #se crea el obj


@app.route('/api/characterization/', methods=['POST']) #no es necesario poner get
def execCharacterization():
    request_data = request.get_json()
    return jsonify(service1.exec(request_data['sequences'], request_data['time']))
   
@app.route('/api/alignment/', methods=['POST']) #no es necesario poner get
def execAlignment():
    request_data = request.get_json()
    return service3.exec(request_data['sequences'], request_data['time'])

@app.route('/api/frequency/', methods=['POST']) #no es necesario poner get
def execFrequency():    
    request_data = request.get_json()
    return jsonify(service4.exec(request_data['sequences'], request_data['time'], request_data['option']))

@app.route('/api/encoding/', methods=['POST']) #no es necesario poner get
def execEncoding():    
    request_data = request.get_json()
    service5.createJob(request_data['time'])
    return jsonify(service5.exec(request_data['sequences'], request_data['time'], request_data['option']))


 

# @app.route('/products/<string:product_name>', methods=['GET'])#es dinamico y depende de products/XXXXX
# def getProduct(product_name):
#     product_found = [product for product in products_list if product['name'] == product_name]
#     if (len(product_found) > 0):
#         return jsonify({"products":product_found[0], "message":"ok, product found"})
#     return jsonify({"message":"error"})

# @app.route('/products', methods=['POST'])#pueden tener la misma ruta si el metodo es diferente
# def addProduct():
#     new_product = {
#         "name": request.json['name'],
#         "price": request.json['price'],
#         "quantity": request.json['quantity']
#     }
#     products_list.append(new_product)
#     return jsonify({"products":products_list, "message":"ok, product added"})

# @app.route('/products/<string:product_name>', methods=['PUT'])#pueden tener la misma ruta si el metodo es diferente
# def editProduct(product_name):
#     product_found = [product for product in products_list if (product['name'] == product_name)]
#     if (len(product_found) >0):
#         product_found[0]['name'] = request.json['name']
#         product_found[0]['price'] = request.json['price']
#         product_found[0]['quantity'] = request.json['quantity']
#         return jsonify({"products":product_found[0], "message":"ok, product updated"})
#     return jsonify({"message":"error"})

# @app.route('/products/<string:product_name>', methods=['DELETE'])#pueden tener la misma ruta si el metodo es diferente
# def deleteProduct(product_name):
#     product_found = [product for product in products_list if (product['name'] == product_name)]
#     if (len(product_found) >0):
#         products_list.remove(product_found[0])
#         return jsonify({"products":products_list, "message":"ok, product eliminated"})
#     return jsonify({"message":"error"})


if (__name__ == "__main__"):#si se esta ejecutando como archivo principal
    app.run(debug=True, port='4000') #con debug el servidor se reiniciar al hacer cambios

