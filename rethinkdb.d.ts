/**
 * Created by Ron on 30/12/2015.
 */
// Type definitions for Rethinkdb
// Project: http://rethinkdb.com/
// Reference: http://www.rethinkdb.com/api/#js

declare module "rethinkdb" {
    namespace r {

        //somehow it caused Maximum call stack size exceeded exceptions
        export type RString = string|RRunnable;
        export type RNumber = number|RRunnable;
        export type RDate = Date|RRunnable;

        type RPluckObject = { [index: string]: string|boolean|string[]|RPluckObject };

        export type FieldType = any;
        export type Literal = any;
        export type RFactory = any;
        export type RFormat = 'native'|'raw';
        export type RDurability = 'hard'|'soft';

        export interface EventEmitter {
            addListener(event: string, listener: Function): void;
            on(event: string, listener: Function): void;
            once(event: string, listener: Function): void;
            removeListener(event: string, listener: Function): void;
            removeAllListeners(event?: string): void;
            setMaxListeners(n: number): void;
            listeners(event: string): void;
            emit(event: string, ...args: any[]): void;
        }

        //#region Options

        export interface ConnectionOptions {
            host?: string; //default 'localhost'
            port?: number; //default 28015
            db?: string; //default 'test'
            authKey?: string;
            timeout?: number; //in seconds, default 20
            ssl?: { caCerts: string }; //path to certificate
        }

        export interface TableCreateOptions {
            primaryKey?: string; //default: "id"
            shards?: number; //1-32
            replicas?: number| { [serverTag: string]: number };
            primaryReplicaTag?: string;
            nonvotingReplicaTags?: string[];
            durability?: RDurability; // "soft" or "hard" defualt: "hard"
        }
        export interface Repair {
            emergencyRepair: 'unsafe_rollback'|'unsafe_rollback_or_erase';
        }

        export interface TableReconfigureOptions {
            shards?: number; //1-32
            replicas?: number| { [serverTag: string]: number };
            primaryReplicaTag?: string;
            dryRun?: boolean;
        }

        export interface TableOptions {
            readMode?: 'single'|'majority'|'outdated'; // "single" "majority" "outdated"
            identifierFormat?: 'name'|'uuid'; //"name" "uuid";
        }

        export interface DeleteOptions {
            returnChanges?: boolean|string|'always'; //true, false or "always" default: false
            durability?: RDurability; // "soft" or "hard" defualt: table
        }

        export interface InsertOptions extends DeleteOptions {
            conflict?: 'error'|'replace'|'update'|((id: RStream, oldDoc: RStream, newDoc: RStream) => RStream); //"error" "replace" "update"
        }

        export interface UpdateOptions extends DeleteOptions {
            nonAtomic?: boolean;
        }

        export interface IndexOptions {
            multi?: boolean,
            geo?: boolean
        }

        export interface RunOptions {
            useOutdated?: boolean; //default false
            timeFormat?: RFormat; //'native' or 'raw', default 'native'
            profile?: boolean; //default false
            durability?: RDurability; //'hard' or 'soft'
            groupFormat?: RFormat; //'native' or 'raw', default 'native'
            noreply?: boolean; //default false
            db?: string;
            arrayLimit?: number; //default 100,000
            binaryFormat?: RFormat; // 'native' or 'raw', default 'native'
            minBatchRows?: number; //default 8
            maxBatchRow?: number; //default unlimited
            maxBatchBytes?: number; //default 1MB
            maxBatchSeconds?: number; //default 0.5
            firstBatchScaledownFactor?: number; //default 4
        }

        export interface HttpRequestOptions {
            //General
            timeout?: number; //default 30
            reattempts?: number; //default 5
            redirects?: number; //default 1
            verify?: boolean; //default true
            resultFormat: 'text'|'json'|'jsonp'|'binary'|'auto'; //"text" "json" "jsonp" "binary" "auto"

            //Request Options
            method?: 'GET'|'POST'|'PUT'|'PATCH'|'DELETE'|'HEAD'; // "GET" "POST" "PUT" "PATCH" "DELETE" "HEAD"
            params?: Object;
            header?: { [key: string]: string|Object };
            data?: Object;
            //Pagination
            page?: string|((param: RStream) => (RString));
            pageLimit: number; //-1 = no limit.

        }

        export interface WaitOptions {
            waitFor?: 'ready_for_outdated_reads'|'ready_for_reads'|'ready_for_writes'|'all_replicas_ready'; //"ready_for_outdated_reads", "ready_for_reads", "ready_for_writes", "all_replicas_ready" default "ready_for_writes"
            timeout?: number;
        }

        export interface ChangesOptions {
            squash?: boolean|number;
            changefeedQueueSize?: number;
            includeInitial?: boolean;
            includeStates?: boolean;
            includeTypes?: boolean;
            includeOffsets?: boolean;
        }

        //#endregion

        //#region Results
        export interface Geometry {
        }
        export interface Line extends Geometry {
        }
        export interface Point extends Geometry {
        }
        export interface Polygon extends Geometry {
        }

        export interface ValueChange<T> {
            old_val?: T;
            new_val?: T;
        }

        export interface DBChangeResult {
            config_changes: ValueChange<{
                id: string;
                name: string;
            }>[];
            tables_dropped: number;
            dbs_created: number;
            dbs_dropped: number;
        }

        export interface DBConfig {
            id: string;
            name: string;
        }

        export interface TableChangeResult {
            tablesCreated?: number;
            tablesDropped?: number;
            configChanges: ValueChange<TableConfig>;
        }

        export interface TableShard {
            primary_replica: string;
            replicas: string[];
            nonvoting_replicas: string[];
        }

        export interface TableConfig {
            id: string;
            name: string;
            db: string;
            primary_key: string; //default: "id"
            shards: TableShard[];
            indexes: string[];
            write_acks: string;
            durability: RDurability; // "soft" or "hard" defualt: "hard"
        }
        export interface TableStatus extends TableConfig {
            status: {
                all_replicas_ready: boolean;
                ready_for_outdated_reads: boolean;
                ready_for_reads: boolean;
                ready_for_writes: boolean;
            };
        }
        export interface IndexStatus {
            function: Buffer;
            geo: boolean;
            index: string;
            multi: boolean;
            outdated: boolean;
            ready: boolean;
        }

        export interface WriteResult<T> {
            deleted: number;
            skipped: number;
            errors: number;
            first_error?: string;
            inserted: number;
            replaced: number;
            unchanged: number;
            generated_keys?: string[];
            warnings?: string[];
            changes?: ValueChange<T>[];
        }

        export interface Changes<T> extends ValueChange<T> {
            state?: 'initializing'|'ready'; //'initializing', 'ready'. cant come together with values
            type?: 'change'|'add'|'remove'|'initial'|'uninitial'|'state';
            old_offset?: number;
            new_offset?: number;
        }

        export interface JoinResult<T1, T2> {
            left: T1;
            right: T2;
        }

        export interface GroupResults<TGroupBy, TReduction> {
            group: TGroupBy;
            reduction: TReduction;
        }

        export interface MatchResults {
            start: number;
            end: number;
            str: string;
            groups: Array<{
                start: number;
                end: number;
                str: string;
            }>;
        }

        export interface Feed<T> extends EventEmitter {
            each(cb: (err: Error, row: T) => boolean|void, onFinishedCallback?: (err: Error) => void): void;
            eachAsync(func: (row: T) => Promise<any>): Promise<any>;

            //events can be 'data' and 'error'
        }

        export interface Cursor<T> extends Feed<T> {
            next(cb: (err: Error, row: T) => void): void;
            next(): Promise<T>;

            toArray(cb: (err: Error, array: Array<T>) => void): void;
            toArray(): Promise<Array<T>>;

            close(): void;
        }

        //#endregion

        export interface Connection extends EventEmitter {
            close(wait: { noreplyWait: boolean }, cb: (err: Error) => void): void;
            close(cb: (err: Error) => void): void;

            close(wait?: { noreplyWait: boolean }): Promise<void>;

            reconnect(wait: { noreplyWait: boolean }, cb: (err: Error) => void): void;
            reconnect(cb: (err: Error) => void): void;

            reconnect(wait?: { noreplyWait: boolean }): Promise<void>;

            use(dbName: string): void;

            noreplyWait(cb: (err: Error) => void): void;
            noreplyWait(): Promise<void>;

            //events can be connect, close, timeout and error.
        }

        export interface RDatabase {
            tableCreate(tableName: string, options: TableCreateOptions): RStream;
            tableDrop(tableName: string): RStream;
            tableList(): RStream;
            table<T>(tableName: string): RTable<T>;

            config(): RStream;
            rebalance(): RStream;
            reconfigure(options: TableReconfigureOptions): RStream;
            wait(options: WaitOptions): RStream;
        }

        export interface RTable<T> extends RStream {
            indexCreate(indexName: string, indexFunction?: MappingFunction<any>|RStream|Array<RStream>, options?: IndexOptions): RStream;
            indexCreate(indexName: string, options?: { multi: boolean, geo: boolean }): RStream;

            indexDrop(indexName: string): RStream;
            indexList(): RStream;
            indexRename(oldName: string, newName: string, options?: { overwrite: boolean }): RStream;
            indexStatus(...indexName: string[]): RStream;
            indexWait(...indexName: string[]): RStream;

            insert(obj: T|T[]|RStream, options?: InsertOptions): RStream;


            get(key: FieldType): RStream;
            getAll(key: FieldType, options?: { index: string }): RStream;
            getAll(key1: FieldType, key2: FieldType, options?: { index: string }): RStream;
            getAll(key1: FieldType, key2: FieldType, key3: FieldType, options?: { index: string }): RStream;
            getAll(key1: FieldType, key2: FieldType, key3: FieldType, key4: FieldType, options?: { index: string }): RStream;

            between(lowKey: FieldType, highKey: FieldType, options?: { index?: string, leftBound?: string, rightBound?: string }): RStream;
            getIntersecting(geometry: RStream, index: { index: string }): RStream;
            getNearest(geometry: RStream, options: { index: string, maxResults?: number, maxDist?: number, unit?: string, geoSystem?: string }): RStream;

            config(): RStream;
            rebalance(): RStream;

            reconfigure(options: TableReconfigureOptions): RStream;
            reconfigure(options: Repair): RStream;
            status(): RStream;

            sync(): RRunnable;
            wait(options: WaitOptions): RStream;
        }
        export type CoerceType = 'array'|'object'|'string'|'binary'|'number';
        export interface RRunnable {
            do<TOut extends RStream>(...args: (RStream|((...args: RStream[]) => TOut))[]): TOut;
            do<TOut>(...args: (RStream|((...args: RStream[]) => TOut))[]): RRunnable;

            forEach<R>(func: (res: RStream) => RStream): RRunnable;

            changes(options?: ChangesOptions): RStream;

            run(conn: Connection, options?: RunOptions): Promise<any>;
            run(conn: Connection, options: RunOptions, cb: (err: Error, result: any) => void): void;
            run(conn: Connection, cb: (err: Error, result: any) => void): void;
        }
        export interface RStream extends RRunnable {
            (attribute: string|RStream): RStream;
            getField(fieldName: string|RStream): RStream;

            default(value: any): RStream;

            update(obj: RFactory, options?: UpdateOptions): RStream;
            replace(obj: RFactory, options?: UpdateOptions): RStream;
            delete(options?: DeleteOptions): RStream;

            //FROM

            innerJoin(other: RStream, predicate: (doc1: RStream, doc2: RStream) => boolean|RStream): RStream;
            outerJoin(other: RStream, predicate: (doc1: RStream, doc2: RStream) => boolean|RStream): RStream; //actually left join
            eqJoin(fieldOrPredicate: string|((doc1: RStream) => boolean|RStream), rightTable: string, options?: { index: string }): RStream;

            zip(): RStream;

            union(other: RStream): RStream;

            map(mapFunction: (doc: RStream) => any): RStream;
            map(stream1: RStream, mapFunction: (doc: RStream, doc1: RStream) => any): RStream;
            map(stream1: RStream, stream2: RStream, mapFunction: (doc: RStream, doc1: RStream, doc2: RStream) => any): RStream;
            map(stream1: RStream, stream2: RStream, stream3: RStream, mapFunction: (doc: RStream, doc1: RStream, doc2: RStream, doc3: RStream) => any): RStream;

            concatMap(mapFunction: RStream|((doc: RStream) => any)): RStream;

            //WHERE

            withFields(...fields: string[]): RStream; //subset of T
            hasFields(...fields: string[]): RStream;
            filter(predicate: RPredicate|Object, options?: { default: FieldType }): RStream;
            includes(geometry: RStream): RStream;
            intersects(geometry: RStream): RStream;

            //LOGIC
            contains(value: FieldType|RPredicate): RStream;

            //ORDER BY
            orderBy(index: { index: string|DescIndex }): RStream;
            orderBy(field: RFactory, index?: { index: string|DescIndex }): RStream;
            orderBy(field1: RFactory, field2: RFactory, index?: { index: string|DescIndex }): RStream;
            orderBy(field1: RFactory, field2: RFactory, field3: RFactory, index?: { index: string|DescIndex }): RStream;
            orderBy(field1: RFactory, field2: RFactory, field3: RFactory, field4: RFactory, index?: { index: string|DescIndex }): RStream;

            //GROUP
            group(field: RFactory, index?: { index?: string; multi?: boolean }): RGrouppedStream;
            group(field1: RFactory, field2: RFactory, index?: { index?: string; multi?: boolean }): RGrouppedStream;
            group(field1: RFactory, field2: RFactory, field3: RFactory, index?: { index?: string; multi?: boolean }): RGrouppedStream;
            group(field1: RFactory, field2: RFactory, field3: RFactory, field4: RFactory, index?: { index?: string; multi?: boolean }): RGrouppedStream;

            //SELECT FUNCTIONS
            count(value?: FieldType|RPredicate): RStream;
            sum(value?: FieldType|RPredicate): RStream;
            avg(value?: FieldType|RPredicate): RStream;
            min(value?: FieldType|RPredicate): RStream;
            max(value?: FieldType|RPredicate): RStream;
            reduce(reduceFunction: (left: RStream, right: RStream) => RStream): RStream;
            fold(base: any, foldFunction: (acc: RStream, next: RStream) => any, options?: {
                emit?: (acc: RStream, next: RStream, new_acc: RStream) => any[]|RStream
                finalEmit?: (acc: RStream) => any[]|RStream
            }): RStream;
            //SELECT
            distinct(): RStream;
            distinct<TIndex>(index: { index: string }): RStream;
            pluck(...fieldNames: (string|RPluckObject)[]): RStream; //subset of T
            without(...fieldNames: any[]): RStream; //subset of T
            merge(...objects: any[]): RStream;

            skip(n: number): RStream;
            limit(n: number): RStream;
            slice(start: number, end?: number, options?: { leftBound: string, rightBound: string }): RStream;
            nth(n: number): RStream;
            sample(n: number): RStream;
            offsetOf(single: RStream|RPredicate): RStream;

            isEmpty(): RStream;


            coerceTo<ArrayOfT>(type: 'array'): RStream;
            coerceTo(type: 'array'): RStream;
            coerceTo<T>(type: 'object'): RStream;
            coerceTo(type: 'string'): RStream;
            coerceTo(type: 'number'): RStream;
            coerceTo(type: 'binary'): RStream;
            coerceTo(type: CoerceType): RStream;
            typeOf(): RStream;
            info(): RStream;

            //These are available when the result is a single value
            (attribute: string|number): RStream;
            default(value: any): RStream;
            hasFields(...fields: string[]): RStream;
            //Works only if T is an array
            append(value: FieldType): RStream;
            prepend(value: FieldType): RStream;
            difference(value: Array<FieldType>|RStream): RStream;
            setInsert(value: FieldType): RStream;
            setUnion(value: FieldType): RStream;
            setIntersection(value: Array<FieldType>|RStream): RStream;
            setDifference(value: Array<FieldType>|RStream): RStream;
            insertAt(index: number, value: FieldType): RStream;
            changeAt(index: number, value: FieldType): RStream;
            spliceAt(index: number, value: Array<FieldType>|RStream): RStream;
            deleteAt(index: number, endIndex?: number): RStream;
            //Works only if T is a string
            match(regexp: string): RStream;
            split(seperator: string, maxSplits?: number): RStream;
            upcase(): RStream;
            downcase(): RStream;
            add(...str: Array<RString>): RStream;
            gt(...value: Array<RString>): RStream;
            ge(...value: Array<RString>): RStream;
            lt(...value: Array<RString>): RStream;
            le(...value: Array<RString>): RStream;
            //Works only for numbers
            add(...num: Array<RNumber>): RStream;
            sub(...num: Array<RNumber|RDate>): RStream;
            mul(...num: Array<RNumber>): RStream;
            div(...num: Array<RNumber>): RStream;
            mod(...num: Array<RNumber>): RStream;
            gt(...value: Array<any>): RStream;
            ge(...value: Array<any>): RStream;
            lt(...value: Array<any>): RStream;
            le(...value: Array<any>): RStream;
            round(): RStream;
            ceil(): RStream;
            floor(): RStream;
            //Works only for bool
            and(...bool: Array<boolean|RStream>): RStream;
            or(...bool: Array<boolean|RStream>): RStream;
            not(): RStream;
            //Works only for Date
            inTimezone(timezone: string): RStream;
            timezone(): RStream;
            during(start: RDate, end: RDate, options?: { leftBound: string, rightBound: string }): RStream;
            date(): RStream;
            timeOfDay(): RStream;
            year(): RStream;
            month(): RStream;
            day(): RStream;
            dayOfWeek(): RStream;
            dayOfYear(): RStream;
            hours(): RStream;
            minutes(): RStream;
            seconds(): RStream;
            toISO8601(): RStream;
            toEpochTime(): RStream;
            //Works only for geo
            distance(geo: RStream, options: { geoSystem: string, unit: string }): RStream;
            toGeojson(): RStream;
            includes(geometry: RStream): RStream;
            intersects(geometry: RStream): RStream;
            //Works only for line
            fill(): RStream;
            polygonSub(polygon2: RStream): RStream;


            toJsonString(): RStream;
            toJSON(): RStream;

            eq(...value: Array<FieldType|RStream>): RStream;
            ne(...value: Array<FieldType|RStream>): RStream;


            keys(): RStream;
            values(): RStream;
        }

        export interface RGrouppedStream extends RRunnable {
            (attribute: string): RGrouppedStream;
            getField(fieldName: string): RGrouppedStream;

            default(value: any): RGrouppedStream;


            delete(options?: DeleteOptions): RGrouppedStream;

            //FROM

            innerJoin(other: RStream, predicate: (doc1: RStream, doc2: RStream) => boolean|RStream): RGrouppedStream;
            outerJoin(other: RStream, predicate: (doc1: RStream, doc2: RStream) => boolean|RStream): RGrouppedStream; //actually left join
            eqJoin(fieldOrPredicate: string|((doc1: RStream) => boolean|RStream), rightTable: string, options?: { index: string }): RGrouppedStream;

            zip(): RGrouppedStream;

            union(other: RStream): RGrouppedStream;

            map(mapFunction: (doc: RStream) => any): RGrouppedStream;
            ma(stream1: RStream, mapFunction: (doc: RStream, doc1: RStream) => any): RGrouppedStream;
            map(stream1: RStream, stream2: RStream, mapFunction: (doc: RStream, doc1: RStream, doc2: RStream) => any): RGrouppedStream;
            map(stream1: RStream, stream2: RStream, stream3: RStream, mapFunction: (doc: RStream, doc1: RStream, doc2: RStream, doc3: RStream) => any): RGrouppedStream;

            concatMap(mapFunction: (doc: RStream) => any): RGrouppedStream;

            //WHERE

            withFields(...fields: string[]): RGrouppedStream; //subset of T
            hasFields(...fields: string[]): RGrouppedStream;
            filter(predicate: RPredicate|Object, options?: { default: FieldType }): RGrouppedStream;
            includes(geometry: RStream): RGrouppedStream;
            intersects(geometry: RStream): RGrouppedStream;

            //LOGIC
            contains(value: FieldType|RPredicate): RGrouppedStream;

            //ORDER BY
            orderBy(field: RFactory, index?: { index: string|DescIndex }): RGrouppedStream;
            orderBy(field1: RFactory, field2: RFactory, index?: { index: string|DescIndex }): RGrouppedStream;
            orderBy(field1: RFactory, field2: RFactory, field3: RFactory, index?: { index: string|DescIndex }): RGrouppedStream;
            orderBy(field1: RFactory, field2: RFactory, field3: RFactory, field4: RFactory, index?: { index: string|DescIndex }): RGrouppedStream;

            //GROUP
            //group(field: RFactory, index?: { index?: string; multi?: boolean }): GrouppedRStreamArray<T>;
            //group(field1: RFactory, field2: RFactory, index?: { index?: string; multi?: boolean }): GrouppedRStreamArray<T>;
            //group(field1: RFactory, field2: RFactory, field3: RFactory, index?: { index?: string; multi?: boolean }): GrouppedRStreamArray<T>;
            //group(field1: RFactory, field2: RFactory, field3: RFactory, field4: RFactory, index?: { index?: string; multi?: boolean }): GrouppedRStreamArray<T>;

            //SELECT FUNCTIONS
            count(value?: FieldType|RPredicate): RGrouppedStream;
            sum(value?: FieldType|RPredicate): RGrouppedStream;
            avg(value?: FieldType|RPredicate): RGrouppedStream;
            min(value?: FieldType|RPredicate): RGrouppedStream;
            max(value?: FieldType|RPredicate): RGrouppedStream;
            reduce(reduceFunction: (left: RStream, right: RStream) => RStream): RGrouppedStream;

            //SELECT
            distinct(): RGrouppedStream;
            pluck(...fieldNames: (string|RPluckObject)[]): RGrouppedStream; //subset of T
            without(...fieldNames: any[]): RGrouppedStream; //subset of T
            //merge<TOut>(...objects: RStream[]): RGrouppedStream;
            //merge<TOut>(func: RStreamFactory<T>): RGrouppedStream;
            merge(...objects: any[]): RGrouppedStream;

            skip(n: number): RGrouppedStream;
            limit(n: number): RGrouppedStream;
            slice(start: number, end?: number, options?: { leftBound: string, rightBound: string }): RGrouppedStream;
            nth(n: number): RGrouppedStream;
            sample(n: number): RGrouppedStream;
            offsetOf(single: RStream|RPredicate): RGrouppedStream;

            isEmpty(): RGrouppedStream;


            coerceTo(type: 'array'): RGrouppedStream;
            coerceTo(type: 'object'): RGrouppedStream;
            coerceTo(type: 'string'): RGrouppedStream;
            coerceTo(type: 'number'): RGrouppedStream;
            coerceTo(type: 'binary'): RGrouppedStream;
            coerceTo(type: CoerceType): RGrouppedStream;
            typeOf(): RStream;
            info(): RStream;

            //These are available when the result is a single value
            (attribute: string|number): RGrouppedStream;
            default(value: any): RGrouppedStream;
            hasFields(...fields: string[]): RGrouppedStream;
            //Works only if T is an array
            append(value: FieldType): RGrouppedStream;
            prepend(value: FieldType): RGrouppedStream;
            difference(value: Array<FieldType>|RStream): RGrouppedStream;
            setInsert(value: FieldType): RGrouppedStream;
            setUnion(value: FieldType): RGrouppedStream;
            setIntersection(value: Array<FieldType>|RStream): RGrouppedStream;
            setDifference(value: Array<FieldType>|RStream): RGrouppedStream;
            insertAt(index: number, value: FieldType): RGrouppedStream;
            changeAt(index: number, value: FieldType): RGrouppedStream;
            spliceAt(index: number, value: Array<FieldType>|RStream): RGrouppedStream;
            deleteAt(index: number, endIndex?: number): RGrouppedStream;
            //Works only if T is a string
            match(regexp: string): RGrouppedStream;
            split(seperator: string, maxSplits?: number): RGrouppedStream;
            upcase(): RGrouppedStream;
            downcase(): RGrouppedStream;
            add(...str: Array<RString>): RGrouppedStream;
            gt(...value: Array<RString>): RGrouppedStream;
            ge(...value: Array<RString>): RGrouppedStream;
            lt(...value: Array<RString>): RGrouppedStream;
            le(...value: Array<RString>): RGrouppedStream;
            //Works only for numbers
            add(...num: Array<RNumber>): RGrouppedStream;
            sub(...num: Array<RNumber|RDate>): RGrouppedStream;
            mul(...num: Array<RNumber>): RGrouppedStream;
            div(...num: Array<RNumber>): RGrouppedStream;
            mod(...num: Array<RNumber>): RGrouppedStream;
            gt(...value: Array<RNumber>): RGrouppedStream;
            ge(...value: Array<RNumber>): RGrouppedStream;
            lt(...value: Array<RNumber>): RGrouppedStream;
            le(...value: Array<RNumber>): RGrouppedStream;
            round(): RGrouppedStream;
            ceil(): RGrouppedStream;
            floor(): RGrouppedStream;
            //Works only for bool
            and(...bool: Array<boolean|RStream>): RGrouppedStream;
            or(...bool: Array<boolean|RStream>): RGrouppedStream;
            not(): RGrouppedStream;
            //Works only for Date
            inTimezone(timezone: string): RGrouppedStream;
            timezone(): RGrouppedStream;
            during(start: RDate, end: RDate, options?: { leftBound: string, rightBound: string }): RGrouppedStream;
            date(): RGrouppedStream;
            timeOfDay(): RGrouppedStream;
            year(): RGrouppedStream;
            month(): RGrouppedStream;
            day(): RGrouppedStream;
            dayOfWeek(): RGrouppedStream;
            dayOfYear(): RGrouppedStream;
            hours(): RGrouppedStream;
            minutes(): RGrouppedStream;
            seconds(): RGrouppedStream;
            toISO8601(): RStream;
            toEpochTime(): RStream;
            //Works only for geo
            distance(geo: RStream, options: { geoSystem: string, unit: string }): RGrouppedStream;
            toGeojson(): RGrouppedStream;
            includes(geometry: RStream): RGrouppedStream;
            intersects(geometry: RStream): RGrouppedStream;
            //Works only for line
            fill(): RGrouppedStream;
            polygonSub(polygon2: RStream): RGrouppedStream;


            toJsonString(): RGrouppedStream;
            toJSON(): RGrouppedStream;

            eq(...value: Array<FieldType|RStream>): RGrouppedStream;
            ne(...value: Array<FieldType|RStream>): RGrouppedStream;


            keys(): RGrouppedStream;
            values(): RGrouppedStream;

            ungroup(): RStream;
        }

        export interface RPredicate {
            (doc: RStream): boolean|RStream;
        }
        export interface MappingFunction<T> {
            (row: RStream): any;
        }

        /*
         changing to any, it's just too much
         interface RStreamFactory<T> {
         (doc: RStream): any;
         }
         */
        export interface DescIndex {
        }
        export interface R {
            minval: any;
            maxval: any;
            desc(indexName: string): DescIndex;

            connect(options: ConnectionOptions, cb: (err: Error, conn: Connection) => void): void;
            connect(host: string, cb: (err: Error, conn: Connection) => void): void;
            connect(options: ConnectionOptions): Promise<Connection>;
            connect(host: string): Promise<Connection>;

            dbCreate(dbName: string): RStream;
            dbDrop(dbName: string): RStream;
            dbList(): RStream;
            db(dbName: string): RDatabase;

            //For default database
            tableCreate(tableName: string, options?: TableCreateOptions): RStream;
            tableDrop(tableName: string): RStream;
            tableList(): RStream;
            table<T>(tableName: string, options?: TableOptions): RTable<T>;
            //additional
            map(stream1: RStream, mapFunction: (doc1: RStream) => any): RStream;
            map(stream1: RStream, stream2: RStream, mapFunction: (doc1: RStream, doc2: RStream) => any): RStream;
            map(stream1: RStream, stream2: RStream, stream3: RStream, mapFunction: (doc1: RStream, doc2: RStream, doc3: RStream) => any): RStream;

            row: RStream;
            literal(any: any): Literal;
            object(...keyValue: any[]): RStream; //should be (key: string, value: any...)
            and(...bool: Array<boolean|RStream>): RStream;
            or(...bool: Array<boolean|RStream>): RStream;
            not(bool: boolean|RStream): RStream;
            random(lowBound?: number, highBound?: number, options?: { float: boolean }): RStream;
            round(num: RNumber): RStream;
            ceil(bool: RNumber): RStream;
            floor(bool: RNumber): RStream;
            now(): RStream;
            time(year: number, month: number, day: number, hour: number, minute: number, second: number, timezone: string): RStream;
            time(year: number, month: number, day: number, timezone: string): RStream;
            epochTime(epochTime: number): RStream;
            ISO8601(time: string, options?: { defaultTimezone: string }): RStream;
            args<T>(arg: T[]): T;
            args(arg: RStream): any;
            binary(data: any): Buffer;
            branch(test: RStream|boolean, trueBranch: any, falseBranchOrTest: any, ...branches: any[]): RStream;
            range(): RStream;
            range(endValue: number): RStream;
            range(startValue: number, endValue: number): RStream;
            error(message?: string): any;
            expr(val: any): RStream;
            (val: any): RStream;
            js(js: string): RStream;
            json(json: string): RStream;
            http(url: string, options: HttpRequestOptions): RStream;
            uuid(): RStream;
            circle(longitudeLatitude: string[]|Point, radius: number, options: { numVertices: number, geoSystem: string, unit: string, fill: boolean }): RStream;
            line(...points: RStream[]): RStream;
            line(...longitudeLatitudes: string[][]): RStream;
            point(longitude: string, latitude: string): RStream;
            polygon(...points: RStream[]): RStream;
            polygon(...longitudeLatitudes: string[][]): RStream;
            add(...args: (string|number|RStream)[]): RStream;
            union(...args: RStream[]): RStream;

            geojson(geoJSON: Object): RStream;
            distance(geo1: RStream, geo2: RStream, options: { geoSystem: string, unit: string }): RStream;
            intersects(stream: RStream, geometry: RStream): RStream;
            intersects(geometry1: RStream, geometry2: RStream): RStream;
            wait(options: WaitOptions): RStream;

            do(arg: RStream, func: (arg: RStream) => any): RStream;
            do(arg1: RStream, arg2: RStream, func: (arg1: RStream, arg2: RStream) => any): RStream;
            do(arg1: RStream, arg2: RStream, arg3: RStream, func: (arg1: RStream, arg2: RStream, arg3: RStream) => any): RStream;
            do(arg1: RStream, arg2: RStream, arg3: RStream, arg4: RStream, func: (arg1: RStream, arg2: RStream, arg3: RStream, arg4: RStream) => any): RStream;
            do(...args: (RStream|((...args: RStream[]) => any))[]): RStream;
        }
    }
    const r: r.R;
    export = r;
}

