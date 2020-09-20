/*
A- Imports
*/
const { ApolloServer, gql } = require('apollo-server');
const sequelize = require('sequelize');
const { Sequelize, DataTypes, where, json, INTEGER } = require('sequelize');
require('dotenv').config();
/*
B- Database connection
*/
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLNonNull, GraphQLList } = require('graphql')
const dataBase = new sequelize('postgres://postgres:0000@localhost:5432/postgres');
dataBase.authenticate().then(() => {console.log('Banco de dados conectado!')}).catch((err)=>{console.log('Banco de dados não conectado: '+err)});

/*
C- Models
*/
  const user = dataBase.define('user', {
      id: { type: DataTypes.INTEGER, primaryKey: true },
      name: { type: DataTypes.STRING },
      nick: { type: DataTypes.STRING },
      email: { type: DataTypes.STRING },
      password : {type: DataTypes.STRING },
      createdAt: { type: DataTypes.DATE },
      updatedAt: { type: DataTypes.DATE },
  });

const creditCard =  dataBase.define('creditCard', {
  id: {type: DataTypes.INTEGER, primaryKey:true},
  number: {type: DataTypes.INTEGER},
  dateValidade: {type:DataTypes.DATE},
  name: {type: DataTypes.INTEGER},
  flagId: {type: DataTypes.INTEGER},
  userId: {type: DataTypes.INTEGER},
});

const flag = dataBase.define('flag', {
  id: {type: DataTypes.INTEGER, primaryKey: true},
  name: {type: DataTypes.STRING},
});

const order =  dataBase.define('order', {
  id: {type: DataTypes.INTEGER, primaryKey: true},
  userId: {type: DataTypes.INTEGER},
  shopId: {type: DataTypes.INTEGER},
  adress: {type: DataTypes.INTEGER},
  status: {type: DataTypes.INTEGER},
  productId: {type: DataTypes.INTEGER},
});

const payment = dataBase.define('payment', {
  id: {type: DataTypes.INTEGER, primaryKey:true},
  value: {type: DataTypes.FLOAT},
  userId: {type: DataTypes.INTEGER},
  shopId: {type: DataTypes.INTEGER},
});

const shop = dataBase.define('shop', {
  id: {type: DataTypes.INTEGER, primaryKey:true},
  name: {type: DataTypes.STRING},
  email: {type: DataTypes.STRING},
  number: {type: DataTypes.INTEGER},
});

const product =  dataBase.define('product', {
    id : { type: DataTypes.INTEGER, primaryKey: true },
    name: { type: DataTypes.STRING },
    description: { type: DataTypes.STRING },
    shopId : { type: DataTypes.INTEGER },
    categoryId : { type: DataTypes.INTEGER },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
})

const address =  dataBase.define('address', {
  id : { type: DataTypes.INTEGER, primaryKey: true },
  type: { type: DataTypes.STRING },
  logr: { type: DataTypes.STRING },
  number: { type: DataTypes.STRING },
  neighborhood : { type: DataTypes.STRING },
  city : { type: DataTypes.STRING },
  state : { type: DataTypes.STRING },
  country : { type: DataTypes.STRING },
  CEP : { type: DataTypes.STRING },
  createdAt: { type: DataTypes.DATE },
  updatedAt: { type: DataTypes.DATE },
  userId: {type: DataTypes.INTEGER},
})

const intensOrder =  dataBase.define('itensOrder', {
  id : { type: DataTypes.INTEGER, primaryKey: true },
  orderId: { type: DataTypes.INTEGER },
  userId: { type: DataTypes.INTEGER },
})

const email =  dataBase.define('email', {
  id : { type: DataTypes.INTEGER, primaryKey: true },
  userId: { type: DataTypes.INTEGER },
  nick: { type: DataTypes.STRING },
  host: { type: DataTypes.STRING },
})

const category = dataBase.define('category', {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  name: { type: DataTypes.STRING },
  img: { type: DataTypes.STRING },
});

/*
D- Relations */
user.hasMany(creditCard);
user.hasMany(order/*, {through: 'intensOrder', as: 'orders', foreginKey: 'ProductId', otherKey: 'OrderId'}*/);
user.hasMany(address);

address.belongsTo(user);

order.belongsTo(user)

creditCard.belongsTo(user);

shop.hasMany(intensOrder);
shop.hasMany(payment);
shop.hasMany(product);

payment.belongsTo(shop);
//payment.belongsTo(user);

product.belongsTo(shop);
product.belongsTo(category);

category.hasMany(product);
//product.belongsToMany(order, {through: 'intensOrder', as:'products', foreginKey: 'OrderId', otherKey: 'ProductId'});

/* FIM*/
/*

E- Queries
*/ 
//=> User.All
async function queryAllUsers(){
  return await user.findAll();
}

//=> User.One(ID)
async function queryOneUser(paramFilterId){
  var localFilterId = paramFilterId;
  return await user.findAll({
    where:{
        id: localFilterId
    }  
  });
}

//query all categories
async function queryAllCategories(){
  return await category.findAll({
    attributes: ['id', 'name', 'img'],
  });
}

//=> User.Multi(name)
async function queryAllUserComplete(){
  return await user.findAll({
    include:[
      {model: address},
      {model: order},
      {model: creditCard}]
  }).then(user =>{
    const resObj = user.map(user => {
      return Object.assign(
        {},
        {
          id:   user.id,
          name: user.name,
          nick: user.nick,
          email: user.email,
          order: user.orders.map(order =>{
            return Object.assign({},
              {
                id: order.id,
                address: order.address,
                stauts: order.status,
                //product: order.product,
              });   
          }),
          address: user.addresses.map(address=>{
            return Object.assign({},
              {
                type: address.type,
                logr: address.logr,
                number: address.number,
                neighborhood: address.neighborhood,
                city: address.city,
                state: address.state,
                city: address.city,
                country: address.country,
                CEP: address.cep,
            });
          }),
          creditCard: user.creditCards.map(creditCard=>{
            return Object.assign({},
              {
                id: creditCard.id,
                number: creditCard.number,
                name: creditCard.name,
                dateValidade: creditCard.dateValidade,
            });
          }),
      })
    })
    return resObj;
  });
}

//=> Product.One(ID)
async function queryOneProduct(paramFilterId){
  var localFilterId = paramFilterId;
  return await product.findAll({
    where:{
        id: localFilterId
    }  
  });
}

async function queryFilterMultiplyProduct(paramKey){
  var localKey = paramKey;
  return await product.findAll({
    where:{
      categoryId: localKey
    },
    include:[
      {model: category},
    ],
  }).then(product=>{
    const resObj = product.map(product => {
      return Object.assign(
        {},
        {
        id: product.id,
        name: product.name,
        category: product.categors.map(category=>{
          return Object.assign(
            {},
            {
              id: category.id,
              name: category.name,
              img: category.img,
            })
        }),
    });
  });
  return resObj;
});
}

//Product.Multi(name)
async function queryOneProductByName(paramFilter){
  var localFilter = paramFilter;
  return await product.findAll({
    where:{
        name: localFilter
    }  
  });
}

//Product.all()
async function queryAllProducts(){
  return await product.findAll({
    attributes: ['id', 'description', 'name', 'categoryId'],
  });
}

//(shop + Product).all()
async function queryAllShopProduct(){
  return await shop.findAll({
    include: [
      {model:product}
    ],
  }).then(shop =>{
    const resObj = shop.map(shop => {
      return Object.assign(
        {},
        {
          id:   shop.id,
          name: shop.name,
          product: shop.products.map(product =>{
            return Object.assign({},
              {
                id: product.id,
                name: product.name,
                description: product.description,
              })              
          })
      })
    })
    return resObj;
  });
}

//
async function queryAllShops(){
  return await shop.findAll({
    attributes: ['id', 'name', 'email', 'number', 'internalStruct'],
  });
}

async function queryFilterByUserAllAddresses(param){
  var localKey = param;
  return await address.findAll({
    where:{
      userId: localKey,
    },
  }).then(address=>{
    const resObj = address.map(address => {
      return Object.assign(
      {},
      {
        type: address.type,
        logr: address.logr,
        number: address.number,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        city: address.city,
        country: address.country,
        CEP: address.cep,
      });
    });
    return resObj;
  });
}

async function queryFilterByUserAllCeditCards(param){
  var localKey= param;
  return await creditCard.findAll({
    where:{
      userId: localKey,
    },
  }).then(creditCard=>{
    const resObj = creditCard.map(creditCard=>{
      return Object.assign(
        {},
        {
        id: creditCard.id,
        name: creditCard.name,
        number: creditCard.number,
        dateValidade: creditCard.dateValidade,
        name: creditCard.name,
      });
      });
      return resObj;
    });
  };

  async function queryOneAddress(param){
    const localKey = param;
    return await address.findAll({
      where:{
        id: localKey,
      },
    });
  }

  async function queryOneCreditCard(param){
    const localKey = param;
    return await creditCard.findAll({
      where:{
        id:localKey,
      },
    });

  }
/* fim */
    /*F- MUTATIONS*/
      async function cUser( paramArgs){
        var cont = paramArgs;
        await user.create({
          id: cont.input.id,
          name: cont.input.name,
          nick: cont.input.nick,
          password: cont.input.password,
          email: cont.input.email,
        });
        return await queryOneUser(cont.input.id)
      }

      async function createProduct(paramArgs){
        var cont = paramArgs;
        await product.create({
          id: cont.input.id,
          description: cont.input.description,
          name: cont.input.name,
          userId: cont.input.userId,
          category: cont.input.category,
        });
        return await queryOneProduct(cont.input.id);
      }
    /*FIM DAS MUTATIONS*/

/*
G- Resolvers
*/
  const resolvers = {
    Query: {
      oneUsersDetail() { return queryOneUsersDetail()},
      oneUser(_, args) { return queryOneUser(args.id) },
      oneProduct(_, args) {return queryOneProduct(args.id)},
      oneAddress(_, args) {return queryOneAddress(args.id)},
      oneCreditCard(_,args) {return queryOneCreditCard(args.id)},
      allUsers() { return queryAllUsers() },
      allProducts() { return queryAllProducts() },
      allShops() { return queryAllShops() },
      allUserComplete() { return queryAllUserComplete() },
      allCategories() { return queryAllCategories() },

      filterMultiplyProduct(_,args) { return queryFilterMultiplyProduct(args.key) },
      filterByUserAllAddresses(_,args) { return queryFilterByUserAllAddresses(args.userId) },
      filterByUserAllCeditCards(_,args) {return queryFilterByUserAllCeditCards(args.userId)},

      allShopProduct() { return queryAllShopProduct() } ,
    },
    Mutation: {
      createUser: async (_, args ) => {
        var cont = args;
        return await cUser(cont);
      },

      async resolverCreateProduct(_, args) { 
        var cont = args;
        console.log(cont); 
        return await createProduct(cont); }
    },
};
/*fim */

/*H- Defs */
const typeDefs = gql`
scalar Date
  type User {
    id: ID
    name: String
    nick: String
    password: String
    createdAt: Date
    updatedAt: Date

    address: [Address]
    order: [Order]
    creditCard: [CreditCard]
    email: String
  }

  type Shop{
    id:ID
    name: String
    email: String
    number: Int

    shop: [Shop]
    product: [Product]
    order: [Order]
  }

  type Product {
    id : ID
    name: String
    description: String

    category : [Category]
  }

  type Category {
    id: ID
    name: String
    img: String
  }
 
  type CreditCard {
    id: ID
    name: String
    dateValidade: Date
    number: String
  }

  type Address{
    id: ID
    type: String
    logr: String
    number: String
    neighborhood: String
    state: String
    city: String
    country: String
    CEP: String
  }

  type Email{
    id: ID
    userId: Int
    nick: String
    host: String
  }

  type Order{
    id: ID
    user: [User]
    product: [Product]
    shop: [Shop]
  }

  type Query {
    oneUsersDetail :[User]
    oneUser(id: Int!): [User]
    oneProduct(id: Int): [Product]
    oneAddress(id: Int): [Address]
    oneCreditCard(id: Int): [CreditCard]
    allCategories: [Category]
    allUsers: [User]
    allProducts: [Product]
    allShops: [Product]
    allUserComplete: [User]

    filterMultiplyProduct(key: Int): [Product]
    filterByUserAllAddresses(userId: Int): [Address]
    filterByUserAllCeditCards(userId: Int): [CreditCard]

    allShopProduct: [Shop]
  }

  input userInput {
    id: ID
    name: String
    email: String
    nick: String
    password: String
    createdAt: Date
    updatedAt: Date
  }

  input productInput {
    id : ID
    name: String
    description: String
    userId : Int
    category : Int
    createdAt: Date
    updatedAt: Date
  }

  type Mutation {
    createUser(input: userInput): [User]
    resolverCreateProduct(input : productInput): [Product]
  }
`;

/*Fim */

//I- Apollo server basede in typedefs and resolvers
const server = new ApolloServer({ typeDefs, resolvers });

//J- Listen to the port
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});

///////////////////