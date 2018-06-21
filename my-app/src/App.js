import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import { compose, graphql} from 'react-apollo'
import ListRecipes from './query/ListRecipes'
import NewRecipeSubscrition from './subscriptions/NewRecipeSubscriptions'
import CreateRecipe from './mutations/CreateRecipe';
import uuidV4 from 'uuid/v4'

class App extends Component {
  state = {
    name: '',
    ingredients : [],
    directions : [],
    ingredient : '',
    direction : ''
  }
  componentDidMount(){
    this.props.subscriptToNewRecipes()
  }
  onChange = ( key, value) => {
    this.setState({[ key]: value })
  }
  addIngredient = () => {
    if(this.state.ingredient === '') return
    const ingredients = this.state.ingredients
    ingredients.push(this.state.ingredient)
    this.setState({
      ingredient : ''
    })
  }
  addDirection = () => {
    if(this.state.direction === '') return
    const directions = this.state.directions
    directions.push(this.state.direction)
    this.setState({
      direction : ''
    })
  }
  addRecipe= () => {
    const {name, ingredients, directions} = this.state
    this.props.onAdd({
      name,
      ingredients,
      directions,
      id : uuidV4()
    })
    this.setState({
      name: '',
      ingredient : '',
      direction : ''
    })
  }
  render() {
    console.log('props : ', this.props);
    return (
      <div className="App" style={styles.container}>
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        {
          this.props.recipes.map((recipe, index) =>(
            <div key={index}>
              <p>{recipe.name}</p>
            </div>
          ))
        }
        <input style={styles.input} value={this.state.name}
        onChange={evt => this.onChange('name',evt.target.value)} placeholder='Recipe Name'/>

         <input style={styles.input} value={this.state.ingredient}
        onChange={evt => this.onChange('ingredient',evt.target.value)} placeholder='Ingredient Name'/>
        <button onClick={this.addIngredient} style={styles.button}>Add Ingredient</button>

        <input style={styles.input} value={this.state.direction}
        onChange={evt => this.onChange('direction',evt.target.value)} placeholder='Direction Name'/>

        <button onClick={this.addDirection} style={styles.button}>Add Direction</button>
        <button onClick={this.addRecipe} style={styles.button}>Add Recipe</button>

      </div>
    );
  }
}

const styles= {
  container : {
    display: 'flex',
    flexDirection : 'column',
  },
  input:{
    height: 50,
    width: 300,
    borderBottom: '2px solid blue',
    margin: 10
  },
  button : {
    height: 50,
    width: 450
  }
}

export default compose(
  graphql(ListRecipes,{
    options : {
      fetchPolicy : 'cache-and-network'
    },
    props : props => ({
      recipes : props.data.listRecipes ? props.data.listRecipes.items : [],
      subscriptToNewRecipes : params => {
        props.data.subscribeToMore({
          document : NewRecipeSubscrition,
          updateQuery : (prev, { subscriptionData : { data : { onCreateRecipe}} }) => ({
            ...prev,
            listRecipes : {
              __typename : 'RecipeConnection',
              items : [ onCreateRecipe, ...prev.listRecipes.items.filter(recipe => recipe.id !== onCreateRecipe.id)]
            }

          })
        })
      }
    })
  }),
  graphql(CreateRecipe, {
    props: props => ({
        onAdd : recipe => props.mutate({
            variables : recipe,
            optimisticResponse : {
              __typename : "Mutation",
              createRecipe : { ...recipe, __typename : 'Recipe'}
            },
            update : (proxy, {data: { createRecipe } }) => {
              const data = proxy.readQuery({query : ListRecipes})
              let hasBeenAdded = false
              data.listRecipes.items.map((item) => {
                if(item.id === createRecipe.id){
                  hasBeenAdded = true
                }
              })
              if ( hasBeenAdded) return
              data.listRecipes.items.push(createRecipe)
              proxy.writeQuery({query : ListRecipes, data})
            }
          })
       
    })
  })
)(App);
