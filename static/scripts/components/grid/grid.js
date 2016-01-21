function loadProductsFromStream(url, done, fail) {
    oboe(url)
        .done(product => {
            done(product);
        })
        .fail(message => {
            fail(message);
        });
}

let GridContainer = React.createClass({
    loadProducts: function() {
        this.setState({loading: true});
        let productsCount = !(this.state.buffer.length && this.state.products.length) ? this.state.limit * 2 : this.state.limit;
        if(this.state.buffer.length > 0) {
            this.flushBuffer();
        }
        let counter = 0;
        let localStore = [];
        this.props.productsLoader(this.getProducstUrl(productsCount),
            product => {
                counter++;
                localStore.push(product);
                if(localStore.length >= this.state.limit) {
                    if(this.state.buffer.length > 0) {
                        this.flushBuffer();
                    }
                    let buffer = this.state.buffer;
                    buffer.push.apply(buffer, localStore);
                    this.setState({buffer: buffer, skip: this.state.skip+localStore.length});
                    localStore = [];
                }
                if(counter >= productsCount) {
                    this.setState({loading: false})
                }
            }, errorMessage => {
                this.flushBuffer();
                this.setState({loading: false, catalogEnd: true});
            }
        );
    },
    flushBuffer: function(){
        let {buffer, products} = this.state;
        products.push.apply(products, buffer);
        products.push({type: 'image', adNumber: this.getUniqueRandomImageNumber(), id: 'img'+buffer[0].id});
        this.setState({products: products, buffer: [], loading: false});
    },
    getProducstUrl: function(limit) {
        return this.props.url +
            $.param(
                {
                    limit: undefined != limit? limit: this.state.limit, skip: this.state.skip, sort: this.state.sort
                }
            );
    }, 
    getInitialState: function() {
        return {
            products: [], 
            buffer: [], 
            skip: 0, 
            limit: 20, 
            loading: false, 
            isVisibilityCheckerVisible: false, 
            sort: 'id', 
            catalogEnd: false
        };
    },
    componentDidMount: function() {
        this.imageNumbers = [];
        for(let i = 0; i <=1000; i++){
            this.imageNumbers.push(i);
        }
    },
    getUniqueRandomImageNumber: function() {
        let randomNumber = Math.floor(Math.random() * this.imageNumbers.length);
        return this.imageNumbers.splice(randomNumber, randomNumber+1)[0];
    },
    visibilityCheckerChangeHandler: function(visible) {
        if(this.state.catalogEnd == true){
            return;
        }
        if(false == this.state.isVisibilityCheckerVisible  && true == visible) {
            this.setState({isVisibilityCheckerVisible: true}, this.loadProducts);
        } else if(true == this.state.isVisibilityCheckerVisible && false == visible) {
            this.setState({isVisibilityCheckerVisible: false});
        }
    },
    setSortColumn: function(column){
        if(this.state.sort != column){
            this.setState(
                {
                    products: [],
                    buffer: [],
                    skip: 0,
                    loading: false,
                    catalogEnd: false,
                    sort: column
                }, this.loadProducts);
        }
    },
    render: function() {
        return(
            <div>

                <table className="table">
                    <thead>
                        <tr>
                            <th>
                                <div onClick={this.setSortColumn.bind(this, 'id')}>{this.state.sort == 'id' &&<i className="fa fa-fw fa-sort"></i>}Id</div>
                            </th>
                            <th>
                                <div onClick={this.setSortColumn.bind(this, "size")}>{this.state.sort == 'size' &&<i className="fa fa-fw fa-sort"></i>}Size</div>
                            </th>
                            <th>
                                <div onClick={this.setSortColumn.bind(this, "price")}>{this.state.sort == 'price' && <i className="fa fa-fw fa-sort"></i>}Price</div>
                            </th>
                            <th>
                                Face
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.products.length && this.state.products.map(function(product, index){
                            return (
                                <GridItem key={product.id} data={product} />
                            );
                        })}

                    </tbody>
                </table>
                <ViewPortVisibilityChecker onVisibilityChange={this.visibilityCheckerChangeHandler} />
                {this.state.loading &&  <span><i className="fa fa-spinner fa-spin"></i> <span>...Loading</span></span>}
                {this.state.catalogEnd && <span>End of catalogue</span>}
            </div>
        );
    }
});
let GridItem = React.createClass({
    render: function(){
        if(this.props.data.type == 'image'){
            return (
                <AdvertComponent key={this.props.key} adNumber={this.props.data.adNumber} />
            );
        } else {
            return (
                <tr>
                    <td>{this.props.data.id}</td>
                    <td>{this.props.data.size}</td>
                    <td>{"$" + this.props.data.price / 100}</td>
                    <td><font size={this.props.data.size}>{this.props.data.face}</font></td>
                </tr>
            );
        }

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
        return (
            <span ref="element">&nbsp;</span>
        );
    }
});
let AdvertComponent = React.createClass({
        render: function(){
            return (
                <tr>
                    <td colSpan="4">
                        <img className="ad" src={'/ad/?r=' + this.props.adNumber} alt="" />
                    </td>
                </tr>
            );
        }
});
ReactDOM.render(
    <GridContainer productsLoader={loadProductsFromStream} url="http://localhost:8000/api/products?" />,
    document.getElementById('products')
);
