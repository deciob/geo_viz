function PetersConf ( full_screen ) {
    
    this.map_height = full_screen ? window.innerHeight - 100 : 500,
    this.map_width = full_screen ? 960 * this.map_height / 500 : 960,
    
    this.norm_scale = 0.36 * this.map_height,
    this.current_scale = this.norm_scale,
    
    this.norm_colour = '#AFBDCC',
    this.highlight_colour = '#D94141';
    
}
