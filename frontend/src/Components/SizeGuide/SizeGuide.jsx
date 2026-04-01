import React from 'react';
import './SizeGuide.css';

const SizeGuide = () => {
  return (
    <div className="size-guide-container">
      <h1>Size Guide</h1>
      
      <div className="size-tables-grid">
        {/* Men's Clothing Size Table */}
        <div className="size-table">
          <h2>Men's Clothing Size Guide</h2>
          <table>
            <thead>
              <tr>
                <th>Size</th>
                <th>Chest (inches)</th>
                <th>Waist (inches)</th>
                <th>Height (inches)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>XS</td><td>32-34</td><td>28-30</td><td>5'4" - 5'6"</td></tr>
              <tr><td>S</td><td>36-38</td><td>30-32</td><td>5'6" - 5'8"</td></tr>
              <tr><td>M</td><td>40-42</td><td>34-36</td><td>5'8" - 6'0"</td></tr>
              <tr><td>L</td><td>44-46</td><td>38-40</td><td>6'0" - 6'2"</td></tr>
              <tr><td>XL</td><td>48-50</td><td>42-44</td><td>6'2" - 6'4"</td></tr>
              <tr><td>XXL</td><td>52-54</td><td>46-48</td><td>6'4" and above</td></tr>
            </tbody>
          </table>
        </div>

        {/* Women's Clothing Size Table */}
        <div className="size-table">
          <h2>Women's Clothing Size Guide</h2>
          <table>
            <thead>
              <tr>
                <th>Size</th>
                <th>Bust (inches)</th>
                <th>Waist (inches)</th>
                <th>Hips (inches)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>XS</td><td>30-32</td><td>24-26</td><td>33-35</td></tr>
              <tr><td>S</td><td>34-36</td><td>27-29</td><td>36-38</td></tr>
              <tr><td>M</td><td>38-40</td><td>30-32</td><td>39-41</td></tr>
              <tr><td>L</td><td>42-44</td><td>34-36</td><td>42-44</td></tr>
              <tr><td>XL</td><td>46-48</td><td>38-40</td><td>45-47</td></tr>
              <tr><td>XXL</td><td>50-52</td><td>42-44</td><td>48-50</td></tr>
            </tbody>
          </table>
        </div>

        {/* Men's Shoe Size Table */}
        <div className="size-table">
          <h2>Men's Shoe Size Guide</h2>
          <table>
            <thead>
              <tr>
                <th>US Size</th>
                <th>EU Size</th>
                <th>UK Size</th>
                <th>Length (inches)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>6</td><td>39</td><td>5.5</td><td>9.6</td></tr>
              <tr><td>7</td><td>40</td><td>6.5</td><td>9.9</td></tr>
              <tr><td>8</td><td>41</td><td>7.5</td><td>10.2</td></tr>
              <tr><td>9</td><td>42</td><td>8.5</td><td>10.5</td></tr>
              <tr><td>10</td><td>44</td><td>9.5</td><td>10.8</td></tr>
              <tr><td>11</td><td>45</td><td>10.5</td><td>11.1</td></tr>
              <tr><td>12</td><td>46</td><td>11.5</td><td>11.4</td></tr>
            </tbody>
          </table>
        </div>

        {/* Women's Shoe Size Table */}
        <div className="size-table">
          <h2>Women's Shoe Size Guide</h2>
          <table>
            <thead>
              <tr>
                <th>US Size</th>
                <th>EU Size</th>
                <th>UK Size</th>
                <th>Length (inches)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>5</td><td>35</td><td>3</td><td>8.8</td></tr>
              <tr><td>6</td><td>36</td><td>4</td><td>9.1</td></tr>
              <tr><td>7</td><td>37</td><td>5</td><td>9.4</td></tr>
              <tr><td>8</td><td>38</td><td>6</td><td>9.7</td></tr>
              <tr><td>9</td><td>39</td><td>7</td><td>10.0</td></tr>
              <tr><td>10</td><td>40</td><td>8</td><td>10.3</td></tr>
              <tr><td>11</td><td>41</td><td>9</td><td>10.6</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SizeGuide;