const express=require('express');
const users=require('./MOCK_DATA.json');
const app=express();
app.get("/user",(req,res)=>{
    const html=`
    <ul>
    ${users.map(user=>`<li>${user.firstname} ${user.lastname}</li>`).join('')}
    </ul>`
    res.send(html);
});
//get method
// app.get('/users',(req,res)=>{
//     res.json(users);
// });
app.get('/api/users',(req,res)=>{
    res.json(users);


});


app.listen(3000,()=>{
    console.log('Server is running on port 3000');
});