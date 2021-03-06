/*
 * Copyright 2012 Sakai Foundation (SF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://www.osedu.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

var bunyan = require('bunyan');

var config = module.exports.config = {};

// UI related config information. By default, we assume that the UI repostory
// can be found on the same level as the Hilary folder.
config.ui = {
    'path': '../3akai-ux'
};

// Cassandra related config information.
config.cassandra = {
    'hosts': ['127.0.0.1:9160'],
    'keyspace': 'oae',
    'user': '',
    'pass': '',
    'timeout': 3000,
    'replication': 1,
    'strategyClass': 'SimpleStrategy'
};

// The redis related configuration information.
// The `dbIndex` key allows for seperation of actual and unit test data.
// By default redis starts up with 16 DB indexes so there should
// be no need to create one.
// We'll assume that:
//  0 = production
//  1 = unit tests
config.redis = {
    'host': '127.0.0.1',
    'port': 6379,
    'pass': '',
    'dbIndex': 0
};

/**
 * `config.servers`
 *
 * Configuration namespace for servers.
 *
 * @param   {String}    globalAdminAlias        The tenant alias that will be used for the global admins.
 * @param   {String}    globalAdminHost         The hostname on which the global admin server can be reached by users.
 * @param   {Number}    globalAdminPort         The network port on which the global admin express server can run.
 * @param   {Number}    tenantPort              The network port on which the tenant express server can run.
 */
config.servers = {
    // Port on which the global admin server should be initialized
    'globalAdminAlias': 'admin',
    'globalAdminHost': 'admin.oae.com',
    'globalAdminPort': 2000,
    'tenantPort': 2001
};

// Configuration regarding file uploads.
// The `uploadDir` key determines where upload files can be buffered before
// moving them over to the configured storage backend.
// The storage backend can be configured in the Admin UI and can be changed
// at runtime.
var tmpDir = process.env.TMP || process.env.TMPDIR || process.env.TEMP || '/tmp' || process.cwd();
var tmpFilesDir = tmpDir + '/uploads';

config.files = {
    'uploadDir': tmpFilesDir
};

// The configuration that can be used to generate secure HTTP cookies.
// It's strongly recommended that you change this value.
// Make sure that this value is the same accross each app server.
config.cookie = {
    'secret': 'this secret will be used to sign your cookies, change me!'
};

config.log = {
    'streams': [
        {
            'level': 'debug',
            'stream': process.stdout
        }
    ],
    'serializers': {
        'err': bunyan.stdSerializers.err,
        'req': bunyan.stdSerializers.req,
        'res': bunyan.stdSerializers.res
    }
};

// This object holds the configuration for the telemetry monitoring.
// By default telemetry is disabled.
// We currently support two types of publishers:
// * displaying data on the console
// * pushing data to circonus (via httptrap and redis)
config.telemetry = {
    'enabled': false,
    'publisher': 'console',
    'circonus': {
        'url': 'https://trap.noit.circonus.net/module/httptrap/check-uuid/secret-here',
        'circonusInterval': 30000,
        'redisInterval': 20000
    },
    'console': {
        'interval': 5000
    }
};

/**
 * `config.search`
 *
 * Configuration namespace for search.
 *
 * @param  {Object[]}  hosts                    The elastic search hosts/ports with which to communicate. Each element of this array is a hash that has 2 keys: 'host' and 'port'.
 * @param  {Object}    index                    Holds configuration properties for the OAE search index.
 * @param  {String}    index.name               The unique name of the index.
 * @param  {Object}    index.settings           Holds the elastic search index configuration settings, as per http://www.elasticsearch.org/guide/reference/api/admin-indices-create-index.html
 * @param  {Boolean}   [index.destroyOnStartup] Whether or not the index should be destroyed when the server starts up. Do not enable this on a production server. Defaults to `false`.
 * @param  {Boolean}   [processIndexJobs]       Whether or not this node should act as an indexer. Only disable this if you have another dedicated set of machines performing index processing. Defaults to `true`.
 */
config.search = {
    'hosts': [
        {
            'host': 'localhost',
            'port': 9200
        }
    ],
    'index': {
        'name': 'oae',
        'settings': {
            'number_of_shards': 5,
            'number_of_replicas': 1,
            'analysis': {
                'analyzer': {
                    'q': {
                        'type': 'custom',
                        'char_filter': ['html_strip'],
                        'tokenizer': 'letter',
                        'filter': ['lowercase', 'q_edgengram']
                    }
                },
                'filter': {
                    'q_edgengram': {
                        'type': 'edgeNGram',
                        'min_gram': 1,
                        'max_gram': 15
                    }
                }
            }
        },
        'destroyOnStartup': false
    },
    'processIndexJobs': true
};

/**
 * `config.mq`
 *
 * Configuration namespace for the message queue (RabbitMQ).
 *
 * @param   {Object}    connection      The connection description
 * @param   {String}    connection.host The host for the connection
 * @param   {Number}    connection.port The port for the connection
 */
config.mq = {
    'connection': {
        'host': 'localhost',
        'port': 5672
    }
};

/**
 * `config.previews`
 *
 * Configuration namespace for the preview processor.
 *
 * @param {Boolean}     enabled                 Whether or not the preview processor should be running.
 * @param {String}      dir                     A directory that can be used to store temporary files in.
 * @param {Object}      office                  Holds the configuration for anything Office related.
 * @paran {String}      office.binary           The path to the 'soffice.bin' binary that starts up Libre Office. ex: On OS X it is `/Applications/LibreOffice.app/Contents/MacOS/soffice.bin` with a default install.
 * @param {Number}      office.timeout          Defines the timeout (in ms) when the Office process should be killed.
 * @param {Object}      pdf                     Holds the configuration for anything related to PDF splitting.
 * @paran {String}      pdf.binary              The path to the `pdftk` binary that can be used to split a PDF file into a PDF-per-page.
 * @param {Number}      pdf.timeout             Defines the timeout (in ms) when the pdftk process should be killed.
 * @param {Object}      credentials             Holds the credentials that can be used to log on the global admin server.
 * @param {String}      credentials.username    The username to login with on the global admin server.
 * @param {String}      credentials.password    The password to login with on the global admin server.
 */
config.previews = {
    'enabled': false,
    'dir': tmpDir + '/previews',
    'office': {
        'binary': 'soffice.bin',
        'timeout': 120000 
    },
    'pdf': {
        'binary': 'pdftk',
        'timeout': 120000
    },
    'credentials': {
        'username': 'administrator',
        'password': 'administrator'
    }
};

/**
 * `config.signing`
 *
 * Configuration namespace for the signing logic
 * FIXME: once https://github.com/sakaiproject/Hilary/issues/331 is addressed, this config can move to the Global Admin Config.
 *
 * @param   {String}    key     This key will be used to sign URLs like profile pictures, content previews, etc.. . It's vital to the security of the system that you change this in production.
 */
config.signing = {
    'key': 'The default signing key, please change me.'
};

/**
 * `config.activity`
 *
 * Configuration namespace for activities.
 *
 * @param  {Boolean}    [processActivityJobs]           Whether or not this server node should produce and route activities. Defaults to `true`
 * @param  {Number}     [activityTtl]                   The time-to-live (in seconds) for generated activities. After this period of time, an activity in an activity feed is lost permanently. Defaults to 2 weeks
 * @param  {Number}     [aggregateIdleExpiry]           The amount of time (in seconds) an aggregate can be idle until it expires. The "idle" time of an aggregate is reset when a new activity occurs that matches the aggregate. Defaults to 3 hours
 * @param  {Number}     [aggregateMaxExpiry]            An upper-bound on the amount of time (in seconds) for which an aggregate can live. Defaults to 1 day
 * @param  {Number}     [numberOfProcessingBuckets]     The number of buckets available for parallel processing of activities. Defaults to 5
 * @param  {Number}     [collectionExpiry]              The maximum amount of time (in seconds) a processing bucket can be locked for at one time. If this is not long enough for an activity processor to collect the number of activities as configured by `collectionBatchSize`, then it will be possible for multiple processors to collect the same bucket concurrently. This will result in duplicate activities, which is not desired. Defaults to 1 minute
 * @param  {Number}     [maxConcurrentCollections]      The maximum number of concurrent collection cycles that can be active on a process at once. Defaults to 3
 * @param  {Number}     [collectionPollingFrequency]    How often (in seconds) the processing buckets are polled for new activities. If -1, polling will be disabled. If polling is disabled, activities will not function, so do not set to -1 in production. Defaults to 5 seconds.
 * @param  {Number}     [collectionBatchSize]           The number of items to process at a time when collecting bucketed activities. After one batch has been collected, the activity processor will immediately continue to process the next batch from that bucket, and so on. Defaults to 500
 */
config.activity = {
    'processActivityJobs': true,
    'activityTtl': 2 * 7 * 24 * 60 * 60,    // 2 weeks (in seconds)
    'numberOfProcessingBuckets': 5,
    'aggregateIdleExpiry': 3 * 60 * 60,     // 3 hours (in seconds)
    'aggregateMaxExpiry': 24 * 60 * 60,     // 1 day (in seconds)
    'collectionExpiry': 60,                 // 1 minute (in seconds)
    'maxConcurrentCollections': 3,
    'collectionPollingFrequency': 5,        // 5 seconds
    'collectionBatchSize': 500
};


