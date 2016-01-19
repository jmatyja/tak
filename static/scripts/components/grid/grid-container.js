let a = 'b';
var GridContainer = React.createClass({
    loadProducts: function() {
        //używamy biblioteki do obsługi json stream ( nie możemy uzyć $.getJSON() ponieważ api zwraca stream, nie http response)
        oboe(this.getProducstUrl())
            .done((product) => {
                let data = this.state.data.slice(0);
                data.push(product);
                this.setState({data: data});
            })
            .fail((message) => {
                console.log("Error while downloading products");
            });
    },
    getProducstUrl: function(){
        return this.props.url + $.param({limit: this.state.limit, skip: this.state.page * this.state.limit})
    },
    getInitialState: function() {
        return {data: [], page: 0, limit: 20};
    },
    componentDidMount: function() {
        this.loadProducts();
        console.log(this.state.data);
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
                        {this.state.data.length && this.state.data.map(function(product){
                            return (
                                <GridItem key={product.id} data={product} />
                            );
                        })}
                    </tbody>
                </table>

            </div>
        );
    }
});
var GridItem = React.createClass({
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
ReactDOM.render(
    <GridContainer url="http://localhost:8000/api/products?=" />,
    document.getElementById('products')
);