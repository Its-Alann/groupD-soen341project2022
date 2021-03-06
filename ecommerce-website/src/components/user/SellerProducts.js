import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Axios from "axios";
import {Container, Row, Col, Button} from 'react-bootstrap'
import './SellerProducts.css'
import baseUrl from "../../SystemVariables";
import {Link} from "react-router-dom";
const SellerProducts = () => {

    const navigate = useNavigate();
    const pageId = useParams();
    const [userProducts, setUserProducts ]= useState([]);
    const [refreshProducts, setRefreshProducts] = useState(0);

    useEffect(()=> {
        const getProductFromServer =baseUrl+ "/getSellerProducts/" + pageId.id;
        Axios.get(getProductFromServer).then((response) => {
          setUserProducts(response.data);
        });
    }, [refreshProducts]);

    function handleRemoveProduct(prodId){
      const url = baseUrl + "/removeProduct";
      Axios.delete(url,{data:{
        id: prodId,
        sellerID: pageId.id
        }
      }).then((res)=> {
        console.log(res.data)
        setRefreshProducts(refreshProducts+1);
      });
    } 
        return(
        // Display seller's item(s)
        <Container Style="padding:20px 0px">
        {
            userProducts.length > 0 ? 
            userProducts.map((product, idx) => (

                <Row>
                  <Col Col lg={true} className="align-self-center">
                      {/* Product Image */}
                      <div className="row-md-6 single-image">
                        <img src={product.imageUrl} className = "img-fluid" alt={product.name} />
                      </div>
                  </Col>
                
                  <Col Col lg={true}>
                    <div className="product-dtl bg-light">
                      {/* Product Name */}
                      <div className="product-name">{product.name}</div>
                      
                      {/* Product Description */}
                      <div className="SingleProductDescription">
                        <p>{product.description}</p>
                      </div>
                
                      <div className="p-3 shadow-sm rounded">
                        {/* Product Price */}
                        <div className="product-count">${product.price}</div>
                
                        {/* Product Quantity */}
                        <Row className="justify-content-md-center">
                          <div className="quantity">
                            <p className="alert">Quantity: {product.quantity}</p>
                          </div>
                        </Row>
                      </div>
                    </div>
                  </Col>

                  <Col Col lg={true} className="align-self-center SellerButtons">
                      {/* Edit/Remove Buttons */}
                      <Row className="SellerEditButton justify-content-center">
                        <button onClick={()=>{
                          navigate("/editProduct/" + product.id);
                        }}>Edit</button>
                      </Row>
                      <Row className="SellerRemoveButton justify-content-center">
                      <button onClick={()=>{
                        handleRemoveProduct(product.id);
                      }}>Remove</button>
                      </Row>
                  </Col>
                </Row>
                
            )) : <div className="retryBtn"><Link exact to="/login"><Button>Please retry logging in</Button></Link></div>
          }
          
        </Container >
    );

}

export default SellerProducts