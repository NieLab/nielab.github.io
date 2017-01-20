
searchPubMed('Qing Nie[Author]')
  .then(fetchResults)
  .then(parseResults)
  .then(displayResults);

function searchPubMed(term) {
    return $.ajax({
        url: 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi',
        data: {
            db: 'pubmed',
            usehistory: 'y',
            term: term,
            retmode: 'json',
            retmax: 0
        }
    });
}

function fetchResults(response) {
    return $.ajax({
        url: 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi',
        data: {
            db: 'pubmed',
            usehistory: 'y',
            webenv: response.esearchresult.webenv,
            query_key: response.esearchresult.querykey,
            retmode: 'xml',
            retmax: 500 // how many items to return
        }
    });
}

function parseResults(response) {
    var nodes = response.querySelectorAll('DocSum');

    return $.map(nodes, function(node) {
        var pmidNode = node.querySelector('Id');
        var doiNode = node.querySelector('Item[Name=DOI]');
        var titleNode = node.querySelector('Item[Name=Title]');
        var sourceNode = node.querySelector('Item[Name=Source]');
        var epubDateNode = node.querySelector('Item[Name=EPubDate]');
        var pubDateNode = node.querySelector('Item[Name=PubDate]');
        var authorNodes = node.querySelectorAll('Item[Name=AuthorList] > Item[Name=Author]');

        return {
            title: titleNode ? titleNode.textContent : null,
            source: sourceNode ? sourceNode.textContent : null,
            authors: $.map(authorNodes, function(authorNode) {
                return authorNode.textContent;
            }),
            url: doiNode ? 'http://dx.doi.org/' + encodeURIComponent(doiNode.textContent) : 'http://pubmed.gov/' + pmidNode.textContent,
            date: epubDateNode && epubDateNode.textContent ? epubDateNode.textContent : pubDateNode.textContent,
        };
    });
}

function displayResults(articles) {
    var output = $('#output');

    $.each(articles, function (i, article) {
        var item = $('<li/>').appendTo(output);
        
        var container = $('<div/>').appendTo(item);
        
        $('<a/>', {
            href: article.url,
            text: article.title
        }).appendTo(container);

        $('<div/>', {
            text: article.authors.join(', ')
        }).appendTo(item);
        
        $('<div/>', {
            text: article.date + ' · ' + article.source 
        }).appendTo(item);
    });
}
