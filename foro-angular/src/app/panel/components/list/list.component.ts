import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';

import {Topic} from '../../../models/topic';
import {UserService} from '../../../services/user.service';
import {TopicService} from '../../../services/topic.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  providers: [UserService, TopicService]
})
export class ListComponent implements OnInit {

  	public page_title: string;
	public topics: Array<Topic>;
	public identity;
	public token;
	public status;


  constructor(
  		private _userService: UserService,
  		private _router: Router,
  		private _route: ActivatedRoute,
  		private _topicService: TopicService
  	){ 
  		this.identity = this._userService.getIdentity();
  		this.token = this._userService.getToken();
  		this.page_title='Mis temas';
  		

  	}

  ngOnInit() {
  	this.getTopics();
  }
  getTopics(){
  	var userId = this.identity._id;
  	this._topicService.getTopicsByUser(userId).subscribe(
  			response	=>{
  				if(response.topics){
  					this.topics = response.topics;
  					this.status= 'success';
  				}
  				else{
  					this.status='error';	
  				}
  			},
  			error		=>{
  				console.log(error);
  				this.status='error';
  			}
  		);
  }

  deleteTopic(id){
      this._topicService.delete(this.token,id).subscribe(
        response  =>{
          if(response.topicRemoved){
            this.getTopics();
          }
          else{
            this.status='error';  
          }
        },
        error    =>{
          console.log(error);
        }
      );
  }

}
