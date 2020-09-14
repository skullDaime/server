/*
A- Imports
*/
const { ApolloServer, gql, makeRemoteExecutableSchema, CheckResultAndHandleErrors } = require('apollo-server');
const sequelize = require('sequelize');
const { Sequelize, DataTypes, where, json, INTEGER } = require('sequelize');
require('dotenv').config();
/*
B- Database connection
*/
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLNonNull, GraphQLList } = require('graphql')
const dataBase = new sequelize('postgres://postgres:0000@localhost:5432/appfacil');
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

const creditCard =  dataBase.define('CreditCard', {
  id: {type: DataTypes.INTEGER, primaryKey:true},
  number: {type: DataTypes.INTEGER},
  validateDAte: {type:DataTypes.DATE},
  name: {type: DataTypes.INTEGER},
  flagId: {type: DataTypes.INTEGER},
});

const flag = dataBase.define('flag', {
  id: {type: DataTypes.INTEGER, primaryKey: true},
  name: {type: DataTypes.STRING},
});

const order =  dataBase.define('order', {
  id: {type: DataTypes.INTEGER, primaryKey: true},
  user: {type: DataTypes.INTEGER},
  shopId: {type: DataTypes.INTEGER},
  adress: {type: DataTypes.INTEGER},
  status: {type: DataTypes.INTEGER},
  product: {type: DataTypes.INTEGER},
});

const payment = dataBase.define('payment', {
  id: {type: DataTypes.INTEGER, primaryKey:true},
  value: {type: DataTypes.FLOAT},
  user: {type: DataTypes.INTEGER},
  shopId: {type: DataTypes.INTEGER},
});

const shop = dataBase.define('shop', {
  id: {type: DataTypes.INTEGER, primaryKey:true},
  name: {type: DataTypes.STRING},
  email: {type: DataTypes.STRING},
  number: {type: DataTypes.INTEGER},
  internalStruct: {type: DataTypes.INTEGER},
});

const product =  dataBase.define('product', {
    id : { type: DataTypes.INTEGER, primaryKey: true },
    name: { type: DataTypes.STRING },
    description: { type: DataTypes.STRING },
    userId : { type: DataTypes.INTEGER },
    category : { type: DataTypes.INTEGER },
    createdAt: { type: DataTypes.DATE },
    updatedAt: { type: DataTypes.DATE },
})

/*
D- Relations */
user.hasMany(creditCard);
creditCard.belongsTo(user);

creditCard.hasOne(flag);
flag.belongsTo(creditCard);

shop.hasMany(order);
order.belongsTo(shop);

shop.hasMany(payment);
payment.belongsTo(shop);

shop.hasMany(product);
product.belongsTo(shop);

user.hasMany(product);
product.belongsTo(user);
/* FIM*/
/*

E- Queries
*/ 
//=> User.All
async function queryUsers(){
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

//=> User.Multi(name)
async function queryOneUserByName(paramFilter){
  var localFilter = paramFilter;
  return await user.findAll({
    where:{
        name: localFilter
    }  
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
async function queryProducts(){
  const res = await product.findAll({
    attributes: ['id', 'description', 'name', 'userId', 'category']
  })
}

//(shop + Product).all()
async function queryUsersDetail(){
  return await shop.findAll({
    include: [
      {model:product}
    ],
  }).then(shop =>{
    const resObj = shop.map(shop => {
      return Object.assign(
        {},
        {
          userId:   shop.id,
          userName: shop.name,
          product: shop.products.map(product =>{
            return Object.assign({},
              {
                productId: product.id,
                productName: product.name,
                productDescript: product.description,
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
      users() { return queryUsers() },
      resolverUsersDetail() { return queryUsersDetail()},
      oneuser(_, args) { return queryOneUser(args.id) },
      products() { return queryProducts() },
      reslverOneProduct(_, args) {return queryOneProduct(args.id)},
      allShops() { return queryAllShops() },
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
    email: String
    nick: String
    password: String
    createdAt: Date
    updatedAt: Date

    userId: Int
    userName: String
    product: [Product]
  }

  type Shop{
    id:ID
    name: String
    email: String
    number: Int

    userId: Int
    userName: String
    product: [Product]
  }

  type Product {
    id : ID
    name: String
    description: String
    userId : String
    category : Int
    userName: String

    productId: Int
    productName: String
    productDescript: String
  }

  type Query {
    resolverUsersDetail : [User]
    users: [User]
    oneuser(id: Int!): [User]
    products: [Product]
    reslverOneProduct(id: Int):[Product]
    allShops: [Shop]
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