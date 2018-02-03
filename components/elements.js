import styled from 'styled-components'

export const Container = styled.div`
  padding: 15px 20px;
`

export const Row = styled.div`
`

export const Col = styled.div`
  display: inline-block;
  vertical-align: middle;
  width: ${props => props.width ? props.width : 'auto' };
  max-width: ${props => props.maxWidth ? props.maxWidth : 'auto' };
`

export const Nav = styled.nav`
  background-color: #592FE4;
  color: white;
  padding: 20px;
`

export const NavTitle = styled.h1`
  margin: 0;
  font-size: 16px;
  letter-spacing: 5px;
  text-transform: uppercase;
`

export const A = styled.a`
  color: inherit;
  &:hover {
    opacity: 0.9;
  }
`

export const Button = styled.button`
  appearance: none;
  border: 0;
  background-color: #1ED760;
  color: white;
  padding: 10px;
  border-radius: 4px;
  font-family: inherit;
  font-size: 18px;

  &:hover {
    background-color: rgb(0,220,0);
  }


  transition: transform 0.1s;
`

export const InputText = styled.input`
  background-color: white;
  border-radius: 4px;
  padding: 20px;
  font-size: 18px;
`

export const Select = styled.select`
  background-color: white;
  border-radius: 2px;
  padding: 20px;
  font-size: 14px;
`

export const LargeButton = styled.button`
  appearance: none;
  border: 0;
  background-color: #1ED760;
  color: white;
  padding: 20px;
  border-radius: 4px;
  font-family: inherit;
  font-size: 18px;

  &:hover {
    background-color: #28FF74;
  }

  transition: background-color 0.3s;
`

export const Section = styled.div`
  border-bottom: 1px solid #dddddd;
`

export const LargeBlueButton = styled.button`
  appearance: none;
  border: 0;
  background-color: #3498db;
  color: white;
  padding: 20px;
  border-radius: 4px;
  font-family: inherit;
  font-size: 18px;

  &:hover {
    background-color: #2980b9;
  }

  transition: background-color 0.3s;
`


export const Hr = styled.div`
  height: 1px;
  display: block;
  background-color: #cccccc;
  margin: 5px 0;
`

export const Score = styled.h2`
  font-size: 120px;
  margin: 0;
  position: absolute;
  top: 0px;
  right: 40px;
`

export const PageWrapper = styled.div`
  padding: 40px;
`

export const CenterPageWrapper = styled.div`
  padding: 40px;
  text-align: center;
`

export const H1 = styled.h1`
  margin: 0;
  font-weight: 600;
`

export const H2 = styled.h2`
  font-weight: 600;
  margin: 0;
`

export const H3 = styled.h3`
  font-weight: 600;
  margin: 0;
`

export const Label = styled.label`
  font-weight: 600;
  margin: 0;
`

export const SecondaryText = styled.span`
  color: #cccccc;
`

export const HilightedText = styled.span`
  color: #1ED760;
`

export const Card = styled.div`
  background-color: white;
  box-shadow: 0px 0px 2px 1px rgba(0, 0, 0, .2);
  border-radius: 4px;
`

export const CardBody = styled.div`
  padding: 10px;
`

export const ShadowBox = styled.div`
  background-color: white;
  box-shadow: 0px 0px 20px 5px rgba(0, 0, 0, .1);
`

export const PadBox = styled.div`
  padding: 20px;
`