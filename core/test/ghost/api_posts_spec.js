/*globals describe, beforeEach, it*/

(function () {
    "use strict";

    var _ = require("underscore"),
        should = require('should'),
        helpers = require('./helpers'),
        Models = require('../../shared/models');

    describe('Bookshelf Post Model', function () {

        var PostModel = Models.Post;

        beforeEach(function (done) {
            helpers.resetData().then(function () {
                done();
            }, done);
        });

        it('can browse', function (done) {
            PostModel.browse().then(function (results) {
                should.exist(results);

                results.length.should.equal(2);

                done();
            }).then(null, done);
        });

        it('can read', function (done) {
            var firstPost;

            PostModel.browse().then(function (results) {
                should.exist(results);

                results.length.should.be.above(0);

                firstPost = results.models[0];

                return PostModel.read({slug: firstPost.attributes.slug});
            }).then(function (found) {
                should.exist(found);

                found.attributes.title.should.equal(firstPost.attributes.title);

                done();
            }).then(null, done);
        });

        it('can edit', function (done) {
            var firstPost;

            PostModel.browse().then(function (results) {

                should.exist(results);

                results.length.should.be.above(0);

                firstPost = results.models[0];

                return PostModel.edit({id: firstPost.id, title: "new title"});

            }).then(function (edited) {

                should.exist(edited);

                edited.attributes.title.should.equal('new title');

                done();

            }).then(null, done);
        });

        it('can add, defaulting as a draft', function (done) {
            var newPost = {
                title: 'Test Title 1',
                content: 'Test Content 1'
            };

            PostModel.add(newPost).then(function (createdPost) {
                should.exist(createdPost);

                createdPost.get('status').should.equal('draft');
                createdPost.get('title').should.equal(newPost.title, "title is correct");
                createdPost.get('content').should.equal(newPost.content, "content is correct");
                createdPost.get('slug').should.equal(newPost.title.toLowerCase().replace(/ /g, '-'), 'slug is correct');

                done();
            }).then(null, done);
        });

        it('can delete', function (done) {
            var firstPostId;
            PostModel.browse().then(function (results) {

                should.exist(results);

                results.length.should.be.above(0);

                firstPostId = results.models[0].id;

                return PostModel.destroy(firstPostId);

            }).then(function () {

                return PostModel.browse();

            }).then(function (newResults) {
                var ids, hasDeletedId;

                ids = _.pluck(newResults.models, "id");

                hasDeletedId = _.any(ids, function (id) {
                    return id === firstPostId;
                });

                hasDeletedId.should.equal(false);

                done();

            }).then(null, done);
        });

        it('can fetch a paginated set, with various options', function (done) {
            this.timeout(4000);

            helpers.insertMorePosts().then(function () {

                return PostModel.findPage({page: 2});

            }).then(function (paginationResult) {

                paginationResult.page.should.equal(2);

                paginationResult.limit.should.equal(15);

                paginationResult.posts.length.should.equal(15);

                paginationResult.pages.should.equal(4);

                return PostModel.findPage({page: 5});

            }).then(function (paginationResult) {

                paginationResult.page.should.equal(5);

                paginationResult.limit.should.equal(15);

                paginationResult.posts.length.should.equal(0);

                paginationResult.pages.should.equal(4);

                return PostModel.findPage({limit: 30});

            }).then(function (paginationResult) {

                paginationResult.page.should.equal(1);

                paginationResult.limit.should.equal(30);

                paginationResult.posts.length.should.equal(30);

                paginationResult.pages.should.equal(2);

                return PostModel.findPage({limit: 10, page: 2, where: {language: 'fr'}});

            }).then(function (paginationResult) {

                paginationResult.page.should.equal(2);

                paginationResult.limit.should.equal(10);

                paginationResult.posts.length.should.equal(10);

                paginationResult.pages.should.equal(3);

                return PostModel.findPage({limit: 10, page: 2, status: 'all'});

            }).then(function (paginationResult) {

                paginationResult.pages.should.equal(11);

                done();

            }).then(null, done);

        });

    });
}());