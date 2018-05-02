# SeeQL


## TODO
* [DONE] Check integrations with React
* Extract schema from BigQuery and put as static config
  https://bigquery.cloud.google.com/queries/see-ql

* Pickup table names and column names in grave accent
* detect if the var is after an operator and a column
* detect the type of that column 
    - categorical
    - numeric
* Add histogram marker
* Implement brushing to change query
* Think about how to implement join
* complex statement
    - see the whole WHERE clause and parse
* subquery
* having

## How to parse SQL
https://www.devart.com/dbforge/sql/sqlcomplete/code-completion.html?gclid=CjwKCAjwt5DXBRAtEiwAa3vyEplbrxtaT3cmYEtBGxqJzgEDzwwcTuIPyJy1cy0PWgvnWyt-YDy_TxoC5roQAvD_BwE
https://github.com/scampi/gosparqled

https://www.apexsql.com/sql_tools_complete.aspx

Parse with REGEX
https://regex101.com/r/sBwpok/3

https://github.com/forward/sql-parser

# code mirror
https://codemirror.net/#features
Supports inline blocks and widgets

To Test
- See how robust SQL Parser is https://github.com/forward/sql-parser
- See if code mirror can really insert widgets
- See how to pickup auto complete
- onChange
    -> parse with sqllite-parser to see source table
    -> token stream for auto complete
    -> advanced token stream processing (Am I in a condition?)
    -> top level considiton parsing

http://codemirror.net/addon/hint/sql-hint.js

## More research papers
https://homes.cs.washington.edu/~magda/papers/khoussainova-vldb11.pdf
https://github.com/dbcli/pgcli

## SQL autocompletion tools
https://www.jetbrains.com/datagrip/

https://bl.ocks.org/mbostock/34f08d5e11952a80609169b7917d4172

## Token Traverse Test Cases

https://stackoverflow.com/questions/15464574/use-google-bigquery-to-build-histogram-graph

```
select
  min(data.VAL) as min,
  max(data.VAL) as max,
  count(data.VAL) as num,
  integer((data.VAL-value.min)/(value.max-value.min)*8) as group
from [table] data
CROSS JOIN (SELECT MAX(VAL) as max, MIN(VAL) as min, from [table]) value
GROUP BY group
ORDER BY group 
```

```
select
  min(score) as min,
  max(score) as max,
  count(score) as num,
  CAST((score - value.min)/(value.max - value.min)*8 AS INT64) as grp
from `bigquery-public-data.hacker_news.stories`
CROSS JOIN (SELECT MAX(score) as max, MIN(score) as min from `bigquery-public-data.hacker_news.stories`) value
GROUP BY grp
ORDER BY grp 
```

