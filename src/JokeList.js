import React, { Component } from 'react'
import axios from "axios";
import uuid from "uuid/dist/v4"
import "./JokeList.css";
import Joke from "./Joke"

class JokeList extends Component{
    static defaultProps = {
        numJokes : 10
    }
    constructor(props){
        super(props)
        this.state = {jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]") , loading :false};
        this.handleClick = this.handleClick.bind(this);
        this.seenJokes = new Set(this.state.jokes.map(j => j.text));
    }
    componentDidMount(){
        if(this.state.jokes.length === 0 ) this.getJokes() ;
    }
    async getJokes(){
    try{
       this.setState({loading: true});
       let jokes = [] ;
       while(jokes.length < this.props.numJokes){
            let res = await axios.get("https://icanhazdadjoke.com/",{
                headers : {Accept : "application/json"}
                });
            let newJoke = res.data.joke;
            if(!this.seenJokes.has(newJoke)){
                jokes.push({id : uuid() , text:newJoke , votes: 0});
            }else{
                console.log("Joke already exists");
                console.log(newJoke);
            }
        }
        this.setState(st => ({jokes : [...st.jokes , ...jokes] , loading: false})
        ,() => {window.localStorage.setItem("jokes" , JSON.stringify(this.state.jokes))}
        );

    }catch(e){
        alert(e);
    }

    }
    handleVote(id , delta){
        this.setState(st => ({
             jokes : st.jokes.map( j =>
                 ( j.id === id ? {...j , votes : j.votes + delta} : j ))
        }),() => {window.localStorage.setItem("jokes" , JSON.stringify(this.state.jokes))}
        );
    }

    handleClick(){
        this.setState({loading: true}, this.getJokes);
    }

    render(){
        let jokes = this.state.jokes.sort((a,b) => b.votes - a.votes )
        if(this.state.loading){
            return (
            <div className="JokeList-spinner">
                <i className="far fa-8x fa-laugh fa-spin"></i>
                <h2 className="JokeList-title">Loading...</h2>
            </div>
            )
        }
        return(
            <div className="JokeList">
              <div className="JokeList-sidebar">
                <h1 className="JokeList-title">
                    <span>Dad</span> Jokes
                </h1>
                <img src='https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg' alt="error" />
                <button className='JokeList-getmore' onClick={this.handleClick} >
                    Fetch Jokes
                </button>
              </div>

              <div className = "JokeList-jokes">
                    {jokes.map(j => (
                    <Joke 
                        key={j.id} 
                        votes={j.votes} 
                        text={j.text}
                        upvote = {() => this.handleVote(j.id,1)}
                        downvote = {() => this.handleVote(j.id,-1)}
                    />
                    ))}
              </div>
            </div>
        )
    }
}

export default JokeList;