import numpy as np
import sys
from matplotlib import pyplot as plt

def plot_graph_for_persona(persona):
    y = [180,150,160,100,160,55]
    color = '#1daae1'

    if (persona == 'kylo'):
        color = '#e74c3c'

    figure = plt.figure(figsize=(20, 10))
    ax = figure.add_subplot(321)
    ax.grid(False)
    plt.bar(np.arange(len(y)), y, color=color, edgecolor='none')
    
    def format_brush_duration(seconds):
        s = seconds % 60
        if (s < 10):
            s = '0' + str(int(s))
        m = int(seconds / 60)
        if (m < 1):
            m = '0'
        return f"{m}:{s}"
    
    ax.set_ylim(0, 200)
    ax.spines['bottom'].set_linewidth(3)
    ax.spines['top'].set_color('black')
    ax.spines['right'].set_color('black')
    ax.spines['left'].set_color('black')
    ax.spines['bottom'].set_color('white')
    for i, v in enumerate(y):
        ax.text(i - 0.3, 50, format_brush_duration(v), fontsize=20, color='white', fontweight='bold')
    plt.yticks(color='black')
    plt.xticks(color='black')
    plt.plot()
    print(f"plotting graph for {persona}", file=sys.stderr)
    figure.savefig(f"static/images/graph_{persona}.png", bbox_inches='tight', dpi=300, transparent=True)