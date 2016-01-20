let GridContainer = React.createClass({
    loadProducts: function() {
        //używamy biblioteki do obsługi json stream ( nie możemy uzyć $.getJSON() ponieważ api zwraca stream, nie http response)
        let url = this.getProducstUrl();
        let counter = 1;
        let buffer = [];
        oboe(this.getProducstUrl(this.state.buffer < this.state.limit ? 40: this.state.limit))
            .done((product) => {
                if(this.state.products.length < this.state.limit) {
                    let products = this.state.products.slice(0);
                    products.push(product);
                    this.setState({products: products, skip: this.state.skip+1});
                } else {
                    let buffer = this.state.buffer.slice(0);
                    buffer.push(product);
                    this.setState({buffer: buffer, skip: this.state.skip+1});
                }
            })
            .fail((message) => {
                console.log("Error while downloading products");
                this.setState({loading: false});
            });
    },
    getProducstUrl: function(limit) {
        return this.props.url + $.param({limit: undefined != limit? limit: this.state.limit, skip: this.state.skip})
    },
    getInitialState: function() {
        return {products: [], buffer: [], skip: 0, limit: 20, loading: false, };
    },
    componentDidMount: function() {
        this.loadProducts();
    },
    visibilityCheckerChangeHandler: function(visible) {
        if(true == visible && this.state.products >= this.state.limit && this.state.loading == false){
            this.setState({loading: true});
            if(this.state.buffer > 0){
                let products = Object.create({}, this.state.products, this.state.buffer.slice(0, this.state.limit));
                this.setState({products:products, loading: false});
                
            }
            this.loadProducts();
        }
    },
    render: function() {
        return(
            <div>
                <table className="table">
                    <thead>
                    <tr>
                        <th>
                            Size
                        </th>
                        <th>
                            Price
                        </th>
                        <th>
                            Face
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                        {this.state.products.length && this.state.products.map(function(product){
                            return (
                                <GridItem key={product.id} data={product} />
                            );
                        })}
                    </tbody>
                </table>
                {this.state.products.length >=20 && <ViewPortVisibilityChecker onVisibilityChange={this.visibilityCheckerChangeHandler} />}
            </div>
        );
    }
});
let GridItem = React.createClass({
    render: function(){
        return (
            <tr>
                <td>{this.props.data.size}</td>
                <td>{this.props.data.price}</td>
                <td>{this.props.data.face}</td>
            </tr>
        );
    }
});

let ViewPortVisibilityChecker = React.createClass({
    // http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport/7557433#7557433
    isElementInViewport: function (el) {
        var rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
            rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
        );
    },
    getInitialState: function() {
        
        return {visibility: false};
    },
    checkIsElementVisible: function() {
        let visibility = this.isElementInViewport(this.refs.element);
        if(this.state.visibility != visibility){
                this.props.onVisibilityChange(visibility);
                this.setState({visibility: visibility});
        }
    },
    componentDidMount: function() {
        this.checkIsElementVisible();
        $(window).on('DOMContentLoaded load resize scroll', this.checkIsElementVisible); 
    },
    componentWillUnmount: function() {
        $(window).off('DOMContentLoaded load resize scroll', this.checkIsElementVisible);
    },
    render: function() {
        return <span ref="element">&nbsp;</span>;
    }
})
ReactDOM.render(
    <GridContainer url="https://worktest-jmatyja.c9users.io:8080/api/products?" />,
    document.getElementById('products')
);