import json

def getPanelPositions():
    layout = {}
    
    layout['clock'] = {}
    layout['clock']['x'] = 0
    layout['clock']['y'] = 0
    
    layout['achievements'] = {}
    layout['achievements']['x'] = -50
    layout['achievements']['y'] = 300
    
    layout['graph'] = {}
    layout['graph']['x'] = 1100
    layout['graph']['y'] = 0

    return json.dumps(layout)