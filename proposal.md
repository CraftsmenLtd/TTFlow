I want to create a full project from scratch for maintaining a full Table Tenis 
tournament for a office annual program where there will be at most 100 users who will 
use the project.

we want to use these techs for the project
frontend : react
Backend : aws resources 
language : ts

Users type can be something like this
- Player (everyone will be a player by default. along with this 'Player' role there can another extra role). The player will have only permission to see the fixture table, point table, game rules etc without any edit or write.
- scorer (this user role will be able to write/modify scores of a match. Can't write anything else like adding/remove user, edit policy, delete or create new matches etc)
- Admin (have all the permissions)
  
Features : 
- Home page
- login (only with company mail having something@craftsmensoftware.com)
- register
- policy or rules page
- Fixture page
- point table or some thing like that
- user portal (showing user info)
- Today's matches (inside it there can be 'My matches section' will route to login first if user not login already)
- feedback section from end users to authority
  
User property
- name
- unique id
- team (office team name)
- mobile (optional)
- email
- profile pic (optional, if user don't upload profile pic then show a avatar)
- user role (player or player, scorer or player, admin etc)
- some property that defines if player is male/female

tournament types
for male 
- single  
- double
for female 
- single


some hints : 
- For game rules you can see the last years rules from https://tt-tournament-2025.netlify.app/. check this and then you can create your own modified version. it will be verified later. this year a player can reschedule his match only once for per match. it will be hardly followed.
- First a user will come to the project. some feature will be visible. then user need to register to participate in the tournament. There should be a super admin role who can change the users role, eliminate a user , schedule a match, delete a match, update a match, update policy etc
- for male user: every registered used need to play both single and double. female will play only single
- for male single players will be splited into multiple group randomly. then from each group will be some matches called first round then quarter, semi, final. although we don't know how much players will be perticipated in the tournament so may be we need to wait for the groups and final rules and roadmap
- for doubles, there will be a randomly lottery to select the players to form a team. it will be published in the website. then teams will be played to complete the tournament. may be we need to wait for the registration completetion to create the full roadmap for double also, but some predefined text can be used as rules.
- super admin should have the permission to reset the random teams and players group and recreate this.
- we want to use the some services to send mails to the users if this is not so cosly. if aws services to send mail is constly we can use any other third party tools
- we will publish it for the tournament time only. we don't need domain. but need to publish it some (may be using aws s3)
- you need to implement the full mechanism of player sorting, eliminations, auth next round match schedular based on points or knock out scenario.