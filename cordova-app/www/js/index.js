/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var sessionId;

var app = {
    // Application Constructor
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function () {
        this.receivedEvent('deviceready');
        sessionId = localStorage.getItem('connect.sid');




        $('#loginButton').click(function () {


            $.ajax({
                type: "POST",
                url: "http://localhost:3000/login",
                data: {username: "asdf", password: "asdf"},
                success: function (data, textStatus, request) {
                    console.log(data, textStatus, request)
                    localStorage.setItem("connect.sid", data.token)
                },
                dataType: "json",
                error: function (request, textStatus, errorThrown) {
                    console.log(request, textStatus, errorThrown)
                }
            });
        })

        $('#registerButton').click(function () {


            $.ajax({
                type: "POST",
                url: "http://localhost:3000/register",
                data: {username: "asdf", password: "asdf", password2: "asdf"},
                success: function (data) {
                    console.log(data)
                },
                dataType: "json",
                error: function (data) {
                    //console.log(data)
                }
            });
        })

        $('#showButton').click(function () {


            $.ajax({
                type: "GET",
                url: "http://localhost:3000/user",
                // data: {username: "asdf", password: "asdf", password2: "asdf"},
                success: function (data) {
                    console.log(data)
                },
                dataType: "json",
                error: function (data) {
                    //console.log(data)
                },
                headers: {
                    "Authorization": localStorage.getItem('connect.sid')
                }
            });
        })

    },

    // Update DOM on a Received Event
    receivedEvent: function (id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();

