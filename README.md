# Deluge
- 43 hexes
    - 1097m each side of the hex
    - Hex width and height is 2197m x 1900m

- Each grid square is 125m x 125m
    - divided into nine keypads, each ~14m x 14m
    
For sake of convenience, hex width and height becomes 2125m x 1875m

Map letters and numbers to x and y values
- Ignore keypad for accuracy?   

17 grid letters A-R

15 grid numbers 1-15

Hex images are 2048 width x 1776 height

keypads 1-9 add quantities of thirds to coordinates
Transformed to X-coordinates 0-16 and Y-coordinates 0-14
- Note that the Y system is inverted, 0 is highest point 14 is lowest
- However the keypad addition is all positive
eg. coordinates (0,0) are A1k0
(1.33,2.66) is B4k2
(1,2) is B3k0
jfc this is disgusting

Distance between (1,1) and (2,3) is (1,1) - (2,3) = (1, 2), which is a vector
Retrieve magnitude from vector and multiply by 125m

function magnitude(first, second) {
    
}


edge cases

1: adding a single category doesn't properly set fac choice