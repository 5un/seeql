import { renderHintColumnValueBar } from './hint-render-helper'
import { 
          findTableName,
          sanitizeColumnName,
          sanitizePrefix,
        } from './helpers'
import sqliteParser from 'sqlite-parser'

export const registerCustomSQLHint = (CodeMirror, datasource) => {
  "use strict";

  var tables;
  var columns;
  var defaultTable;
  var keywords;
  var identifierQuote;
  var CONS = {
    QUERY_DIV: ";",
    ALIAS_KEYWORD: "AS"
  };
  var Pos = CodeMirror.Pos, cmpPos = CodeMirror.cmpPos;
  let mainTableName

  function isArray(val) { return Object.prototype.toString.call(val) == "[object Array]" }

  function getKeywords(editor) {
    var mode = editor.doc.modeOption;
    if (mode === "sql") mode = "text/x-sql";
    return CodeMirror.resolveMode(mode).keywords;
  }

  function getIdentifierQuote(editor) {
    var mode = editor.doc.modeOption;
    if (mode === "sql") mode = "text/x-sql";
    return "`";
    //return CodeMirror.resolveMode(mode).identifierQuote || "`";
  }

  function getText(item) {
    return typeof item == "string" ? item : item.text;
  }

  function wrapTable(name, value) {
    if (isArray(value)) value = {columns: value}
    if (!value.text) value.text = name
    return value
  }

  function parseTables(input) {
    var result = {}
    if (isArray(input)) {
      for (var i = input.length - 1; i >= 0; i--) {
        var item = input[i]
        result[getText(item).toUpperCase()] = wrapTable(getText(item), item)
      }
    } else if (input) {
      for (var name in input)
        result[name.toUpperCase()] = wrapTable(name, input[name])
    }
    return result
  }

  function getTable(name) {
    return tables[name.toUpperCase()]
  }

  function shallowClone(object) {
    var result = {};
    for (var key in object) if (object.hasOwnProperty(key))
      result[key] = object[key];
    return result;
  }

  function match(string, word) {
    var len = string.length;
    var sub = getText(word).substr(0, len);
    return string.toUpperCase() === sub.toUpperCase();
  }

  function addMatches(result, search, wordlist, formatter) {
    if (isArray(wordlist)) {
      for (var i = 0; i < wordlist.length; i++)
        if (match(search, wordlist[i])) result.push(formatter(wordlist[i]))
    } else {
      for (var word in wordlist) if (wordlist.hasOwnProperty(word)) {
        var val = wordlist[word]
        if (!val || val === true)
          val = word
        else
          val = val.displayText ? {text: val.text, displayText: val.displayText} : val.text
        if (match(search, val)) result.push(formatter(val))
      }
    }
  }

  function cleanName(name) {
    // Get rid name from identifierQuote and preceding dot(.)
    if (name.charAt(0) == ".") {
      name = name.substr(1);
    }
    // replace doublicated identifierQuotes with single identifierQuotes
    // and remove single identifierQuotes
    var nameParts = name.split(identifierQuote+identifierQuote);
    for (var i = 0; i < nameParts.length; i++)
      nameParts[i] = nameParts[i].replace(new RegExp(identifierQuote,"g"), "");
    return nameParts.join(identifierQuote);
  }

  function insertIdentifierQuotes(name) {
    var nameParts = getText(name).split(".");
    for (var i = 0; i < nameParts.length; i++)
      nameParts[i] = identifierQuote +
        // doublicate identifierQuotes
        nameParts[i].replace(new RegExp(identifierQuote,"g"), identifierQuote+identifierQuote) +
        identifierQuote;
    var escaped = nameParts.join(".");
    if (typeof name == "string") return escaped;
    name = shallowClone(name);
    name.text = escaped;
    return name;
  }

  function nameCompletion(cur, token, result, editor) {
    // Try to complete table, column names and return start position of completion
    var useIdentifierQuotes = false;
    var nameParts = [];
    var start = token.start;
    var cont = true;
    while (cont) {
      cont = (token.string.charAt(0) == ".");
      useIdentifierQuotes = useIdentifierQuotes || (token.string.charAt(0) == identifierQuote);

      start = token.start;
      nameParts.unshift(cleanName(token.string));

      token = editor.getTokenAt(Pos(cur.line, token.start));
      if (token.string == ".") {
        cont = true;
        token = editor.getTokenAt(Pos(cur.line, token.start));
      }
    }

    // Try to complete table names
    var string = nameParts.join(".");
    addMatches(result, string, tables, function(w) {
      return useIdentifierQuotes ? insertIdentifierQuotes(w) : w;
    });

    // Try to complete columns from defaultTable
    addMatches(result, string, defaultTable, function(w) {
      return useIdentifierQuotes ? insertIdentifierQuotes(w) : w;
    });

    // Try to complete columns
    string = nameParts.pop();
    var table = nameParts.join(".");

    var alias = false;
    var aliasTable = table;
    // Check if table is available. If not, find table by Alias
    if (!getTable(table)) {
      var oldTable = table;
      table = findTableByAlias(table, editor);
      if (table !== oldTable) alias = true;
    }

    var columns = getTable(table);
    if (columns && columns.columns)
      columns = columns.columns;

    if (columns) {
      addMatches(result, string, columns, function(w) {
        var tableInsert = table;
        if (alias == true) tableInsert = aliasTable;
        if (typeof w == "string") {
          w = tableInsert + "." + w;
        } else {
          w = shallowClone(w);
          w.text = tableInsert + "." + w.text;
        }
        return useIdentifierQuotes ? insertIdentifierQuotes(w) : w;
      });
    }

    return start;
  }

  function eachWord(lineText, f) {
    var words = lineText.split(/\s+/)
    for (var i = 0; i < words.length; i++)
      if (words[i]) f(words[i].replace(/[,;]/g, ''))
  }

  function findTableByAlias(alias, editor) {
    var doc = editor.doc;
    var fullQuery = doc.getValue();
    var aliasUpperCase = alias.toUpperCase();
    var previousWord = "";
    var table = "";
    var separator = [];
    var validRange = {
      start: Pos(0, 0),
      end: Pos(editor.lastLine(), editor.getLineHandle(editor.lastLine()).length)
    };

    //add separator
    var indexOfSeparator = fullQuery.indexOf(CONS.QUERY_DIV);
    while(indexOfSeparator != -1) {
      separator.push(doc.posFromIndex(indexOfSeparator));
      indexOfSeparator = fullQuery.indexOf(CONS.QUERY_DIV, indexOfSeparator+1);
    }
    separator.unshift(Pos(0, 0));
    separator.push(Pos(editor.lastLine(), editor.getLineHandle(editor.lastLine()).text.length));

    //find valid range
    var prevItem = null;
    var current = editor.getCursor()
    for (var i = 0; i < separator.length; i++) {
      if ((prevItem == null || cmpPos(current, prevItem) > 0) && cmpPos(current, separator[i]) <= 0) {
        validRange = {start: prevItem, end: separator[i]};
        break;
      }
      prevItem = separator[i];
    }

    if (validRange.start) {
      var query = doc.getRange(validRange.start, validRange.end, false);

      for (var i = 0; i < query.length; i++) {
        var lineText = query[i];
        eachWord(lineText, function(word) {
          var wordUpperCase = word.toUpperCase();
          if (wordUpperCase === aliasUpperCase && getTable(previousWord))
            table = previousWord;
          if (wordUpperCase !== CONS.ALIAS_KEYWORD)
            previousWord = word;
        });
        if (table) break;
      }
    }
    return table;
  }

  function expandUntilKeyword(editor, idx) {
    const contentLength = editor.getValue().length
    const pos = editor.posFromIndex(idx)
    const token = editor.getTokenAt(pos)
    
    // these operators could be a part of the condition
    const allowedKeywords = ['and', 'count', 'in', 'not', 'or', 'like']

    if(idx <= 0) {
      // It's already at the beginning of the string
      return [];
    } else if(idx > contentLength) {
      return [];
    } else if(token.type === 'keyword' && allowedKeywords.indexOf(token.string.toLowerCase()) === -1) {
      return [token]
    } else {
      const tokenStart = editor.indexFromPos({line: pos.line, ch: token.start})
      const tokenEnd = editor.indexFromPos({line: pos.line, ch: token.end})
      let mergedTokens = [];
      
      if(tokenStart - 1 > 0) 
        mergedTokens = mergedTokens.concat(expandUntilKeyword(editor, tokenStart - 1))

      mergedTokens = mergedTokens.concat([token])

      if(tokenEnd + 1 < editor.contentLength)
        mergedTokens = mergedTokens.concat(expandUntilKeyword(editor, tokenEnd + 1))
      
      return mergedTokens
    }
  }

  function isOperator(token) {
    return token.type === 'operator' || 
             (token.type === 'keyword' && token.string.toLowerCase() ==='like')
  }

  function getImmediateWhereClause(editor, idx) {
    const tokens = expandUntilKeyword(editor, idx)
    console.log(tokens)
    if(tokens.length <= 2) {
      return null
    } else if(tokens[0].string.toLowerCase() !== 'where') {
      return null
    } else {
      tokens.splice(0, 1)
      // console.log(tokens)
      let immediateCondition = null

      if(tokens.length >= 3 && 
          tokens[tokens.length - 3].type === 'variable-2' && 
          isOperator(tokens[tokens.length - 2])) {

        immediateCondition = {
          operator: tokens[tokens.length - 2].string,
          column: tokens[tokens.length - 3].string,
          valuePrefix: tokens[tokens.length - 1].string
        }

      } else if(
          tokens[tokens.length - 2].type === 'variable-2' && 
          isOperator(tokens[tokens.length - 1])) {

        immediateCondition = {
          operator: tokens[tokens.length - 1].string,
          column: tokens[tokens.length - 2].string
        }
      }

      return {
        immediateCondition: immediateCondition,
        whereClauseTokens: tokens
      };
      // Also parse immediate clause here
    }
  }

  function suggestHintsForConditionalValues(editor, callback, options) {
    // TODO: Check if the column is a numeric or text column
    const cur = editor.getCursor()
    const token = editor.getTokenAt(cur)
    const start = token.start
    const end = token.end

    // also find table name here

    const columnName = options.columnName
    const operator = options.operator
    const tableName = options.tableName
    const prefix = options.valuePrefix ? sanitizePrefix(options.valuePrefix) : undefined

    datasource
      .getColumnSuggestedValues(sanitizeColumnName(columnName), tableName, prefix)
      .then(res => {
        if(res.body.type == 'STRING' || res.body.type == 'BOOLEAN') {
          const maxVal = res.body.values.length > 0 ? res.body.values[0].row_count : res.body.total_rows
          const list = res.body.values.map(columnVal => ({
            text: `'${columnVal.value}'`,
            displayText: `${columnVal.value}`,
            count: columnVal.row_count,
            totalCount: maxVal,
            render: renderHintColumnValueBar
          }))

          callback({
            list,
            from: Pos(cur.line, start),
            to: Pos(cur.line, end), 
          })
        } else if(res.body.type == 'INTEGER' || res.body.type == 'FLOAT') {
          const list = res.body.values.map(columnVal => ({
            text: `${columnVal.min}`,
            displayText:  `${columnVal.min} - ${columnVal.max}`,
            count: columnVal.num,
            totalCount: _.maxBy(res.body.values, 'num').num,
            render: renderHintColumnValueBar
          }))
          console.log(list)

          callback({
            list,
            from: Pos(cur.line, start),
            to: Pos(cur.line, end), 
          })
        }
        
      })
      .catch(err => {
        console.error(err)
        // Error sillenty
      })

  }

  function suggestHintsForKeywordsAndNames(editor, callback, options) {
    
    tables = parseTables(options && options.tables)
    columns = options.columns
    var defaultTableName = options && options.defaultTable
    var disableKeywords = options && options.disableKeywords
    defaultTable = defaultTableName && getTable(defaultTableName)

    const cur = editor.getCursor()
    const token = editor.getTokenAt(cur)
    const keywords = getKeywords(editor)
    const identifierQuote = getIdentifierQuote(editor)
    let start, end, search, result = []

    if (token.string.match(/^[.`"\w@]\w*$/)) {
      search = token.string;
      start = token.start;
      end = token.end;
    } else {
      start = end = cur.ch;
      search = "";
    }
    if (search.charAt(0) == "." || search.charAt(0) == identifierQuote) {
      start = nameCompletion(cur, token, result, editor);
    } else {
      addMatches(result, search, defaultTable, function(w) {return {text:w, className: "CodeMirror-hint-table CodeMirror-hint-default-table"};});
      addMatches(
          result,
          search,
          tables,
          function(w) {
              if (typeof w === 'object') {
                  w.className =  "CodeMirror-hint-table";
              } else {
                  w = {
                    text: `\`${w}\``, 
                    displayText: `❖[TABLE]: ${w}`,
                    className: "CodeMirror-hint-table"
                  };
              }

              return w;
          }
      );
      addMatches(
          result,
          search,
          columns,
          function(w) {
              if (typeof w === 'object') {
                return {
                  text: `\`${w.text}\``, 
                  displayText: `◇[COLUMN]: ${w.text}`,
                  className: "CodeMirror-hint-table"
                };
              } else {
                  w = {
                    text: `\`${w}\``, 
                    displayText: `◇[COLUMN]: ${w}`,
                    className: "CodeMirror-hint-table"
                  };
              }

              return w;
          }
      );
      if (!disableKeywords)
        addMatches(result, search, keywords, function(w) {return {text: w.toUpperCase(), className: "CodeMirror-hint-keyword"};});
    }

    setTimeout(() => { 
      callback({list: result, from: Pos(cur.line, start), to: Pos(cur.line, end)});
    }, 10)
  }

  const debouncedSuggestHintsForConditionalValues = _.debounce((editor, callback, options) => {
    suggestHintsForConditionalValues(editor, callback, options)
  }, 300)

  // Main hint function
  CodeMirror.registerHelper("hint", "sql", function(editor, callback, options) {

    // tables = parseTables(options && options.tables)
    // var defaultTableName = options && options.defaultTable;
    // var disableKeywords = options && options.disableKeywords;
    // defaultTable = defaultTableName && getTable(defaultTableName);

    // if (defaultTableName && !defaultTable)
    //   defaultTable = findTableByAlias(defaultTableName, editor);

    // defaultTable = defaultTable || [];

    // if (defaultTable.columns)
    //   defaultTable = defaultTable.columns;

    var cur = editor.getCursor();
    var curPos = editor.indexFromPos(cur)
    var token = editor.getTokenAt(cur), start, end, search;

    if (token.end > cur.ch) {
      token.end = cur.ch;
      token.string = token.string.slice(0, cur.ch - token.start);
    }

    if(options.ast) {
      mainTableName = findTableName(options.ast)
    }

    const immediateWhereClause = getImmediateWhereClause(editor, curPos)

    // console.log(mainTableName, immediateWhereClause)

    if(immediateWhereClause != null && 
        immediateWhereClause.immediateCondition != null) {

      console.log('getting suggestion');

      const condition = immediateWhereClause.immediateCondition
      debouncedSuggestHintsForConditionalValues(editor, callback, {
        columnName: condition.column, 
        operator: condition.operator, 
        tableName: mainTableName,
        valuePrefix: condition.valuePrefix
      });

    } else {

      suggestHintsForKeywordsAndNames(editor, callback, options);

    }
    
  });

  // Make the auto completion async
  CodeMirror.hint.sql.async = true;

};
