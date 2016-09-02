'use strict';
/**
 * Created by Diluka on 2016-07-19.
 *
 *
 * ----------- 神 兽 佑 我 -----------
 *        ┏┓      ┏┓+ +
 *       ┏┛┻━━━━━━┛┻┓ + +
 *       ┃          ┃
 *       ┣     ━    ┃ ++ + + +
 *      ████━████   ┃+
 *       ┃          ┃ +
 *       ┃  ┴       ┃
 *       ┃          ┃ + +
 *       ┗━┓      ┏━┛  Code is far away from bug
 *         ┃      ┃       with the animal protecting
 *         ┃      ┃ + + + +
 *         ┃      ┃
 *         ┃      ┃ +
 *         ┃      ┃      +  +
 *         ┃      ┃    +
 *         ┃      ┗━━━┓ + +
 *         ┃          ┣┓
 *         ┃          ┏┛
 *         ┗┓┓┏━━━━┳┓┏┛ + + + +
 *          ┃┫┫    ┃┫┫
 *          ┗┻┛    ┗┻┛+ + + +
 * ----------- 永 无 BUG ------------
 */
const EventEmitter = require("events");
const AV = require("leanengine");
const _ = require("underscore");

class _LargeQuery extends EventEmitter {
    constructor(query, pageInfo) {
        super();
        this.query = query;
        this.pageInfo = _.extend({}, {skip: 0, limit: 100}, pageInfo);
        this.results = [];
        this.skip = this.pageInfo.skip;
        this.limit = Math.min(1000, this.pageInfo.limit);


        this.on("fetch", this.onFetch);
        this.on("retrieve", this.onRetrieve);
    }

    onFetch() {
        this.query.skip(this.skip).limit(this.limit).find().then(list=> {
            this.emit("retrieve", list);
        }).fail(e=>this.on("error", e));
    }

    onRetrieve(list) {
        this.results.push(...list);
        if (list.length < 1000 || this.results.length >= this.pageInfo.limit) {
            this.emit("finish", this.results);
        } else {
            this.skip += this.limit;
            if (this.skip + this.limit > this.pageInfo.skip + this.pageInfo.limit) {
                this.limit = this.pageInfo.skip + this.pageInfo.limit - this.skip;
            }
            this.emit("fetch");
        }
    }
}

class LargeQuery {
    constructor(query, pageInfo) {
        this._largeQuery = new _LargeQuery(query, pageInfo);
    }

    getResults() {
        this._largeQuery.onFetch();
        return new AV.Promise((resolve, reject)=> {
            this._largeQuery.on("finish", resolve);
            this._largeQuery.on("error", reject);
        });
    }
}

module.exports = LargeQuery;
