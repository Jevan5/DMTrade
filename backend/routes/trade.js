var express = require('express');
var router = express.Router();

var Trades = require('../models/trade');

var TokenHelper = require('../tools/tokenHelper');

router.route('/')
    .get(function(req, res){

    })
    .post(function(req, res){

    });

router.route('/:trade_id')
    .delete(function(req, res){
        TokenHelper.checkToken(res.get('token')).then(function(person){
            if(person.error){
                res.status(400).json({ error: person.error });
            } else{
                return Trades.findById(req.params.trade_id);
            }
        }).then(function(trade, error){
            if(error){
                throw error;
            } else{
                
            }
        })
        .catch(function(error){
            res.status(400).send({ error: error });
        });
    })
    .get(function(req, res){

    })
    .put(function(req, res){

    });